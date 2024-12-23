// Author: Ian Vidmar
// Description: Tries to prevent the app from closing itself if the integrity checks failed. 

var printModules = false;

if (printModules){
    var modules = Process.enumerateModules();
    modules.forEach(function(module) {
        console.log(module.name);
    });
}


// Anti debug detection
Java.perform(function () {
    var Debug = Java.use("android.os.Debug");
    Debug.isDebuggerConnected.implementation = function () {
        console.log("[+] Bypassing Debug.isDebuggerConnected()");
        return false;
    };
});


Java.perform(function () {
    var ProcessKt = Java.use("kotlin.system.ProcessKt");
    ProcessKt.exitProcess.overload('int').implementation = function (i) {
        console.log("[+] kotlin.system.ProcessKt.exitProcess called with param: " + i + '\n');
    };
});


Java.perform(function () {
    var Process = Java.use("android.os.Process");
    Process.killProcess.implementation = function (pid) {
        console.log("killProcess called with pid: " + pid);
        Java.perform(function () {
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
        });
    };
});
console.log("[+] Java.perform killprocess")


Java.perform(function () {
    var System = Java.use("java.lang.System");
    System.exit.implementation = function (code) {
        console.log("[+] System.exit called with code: " + code + '\n');
    };
});
console.log("[+] Java.perform java.lang.System.exit\n");


Java.perform(function () {
    var Method = Java.use("java.lang.reflect.Method");
    Method.invoke.implementation = function (receiver, args) {
        var methodName = this.getName();
        if (methodName === "exit") { //play with this, maybe they changed its name
            console.log("[+] reflect.Method.invoke called!");
            console.log("receiver: " + receiver)
            console.log("args: " + args)
            console.log("[!] Preventing reflective System.exit call.");
            return null;
        }
        return this.invoke(receiver, args);
    };
});


Java.perform(function () {
    var Service = Java.use("android.app.Service");
    Service.onDestroy.implementation = function () {
        console.log("[+] Service.onDestroy called");
        return;
    };
});


var ActivityManager = Java.use("android.app.ActivityManager");
ActivityManager.killBackgroundProcesses.implementation = function (packageName) {
    console.log(`[+] Attempt to kill package: ${packageName}`);
};

var Runtime = Java.use("java.lang.Runtime");
Runtime.halt.implementation = function (code) {
    console.log(`[+] Runtime.halt called with code: ${code}`);
};

var PowerManager = Java.use("android.os.PowerManager");
PowerManager.reboot.implementation = function (reason) {
    console.log(`[+] PowerManager.reboot called with reason: ${reason}`);
};

var System = Java.use("java.lang.System");
System.gc.implementation = function () {
    console.log("[+] System.gc() called\n");
};


// Hook the thread creation function to monitor GLThread 121
var pthread_create = Module.findExportByName(null, "pthread_create")
Interceptor.attach(pthread_create, {
    onEnter: function (args) {
        //console.log("pthread_create called");
        console.log("Thread start routine: " +args[0] +", " + args[1] + ", " + args[2] + ", " + args[3] + "\n");
    },
    onLeave: function (retval) {
        //console.log("pthread_create returned: " + retval.toInt32());
    }
});
console.log("[+] pthread_create attached")


Interceptor.replace(pthread_create, new NativeCallback((thread, attr, start_routine, arg) => {
    console.log("[*] pthread_create intercepted!");
    console.log("[0] (uint)* thread id: " + thread);
    console.log("[1] (struct)* atributes: " + ptr(attr));
    console.log("[2] (void)* function: " + start_routine);
    console.log("[3] (void)* arguments: " + arg);
    console.log("\n");

    const originalPthreadCreate = new NativeFunction(pthread_create, 'int', ['pointer', 'pointer', 'pointer', 'pointer']);
    const result = originalPthreadCreate(thread, attr, start_routine, arg);
    // Optionally modify the return value or just forward it
    return result; // Forward the original result
}, 'int', ['pointer', 'pointer', 'pointer', 'pointer']));




Java.perform(function () {
    var Thread = Java.use("java.lang.Thread");
    var ThreadGroup = Java.use("java.lang.ThreadGroup");
    var group = Java.cast(Thread.currentThread().getThreadGroup(), ThreadGroup);
    console.log("Active threads: " + group.activeCount());
});
console.log("[+] Java.perform java.lang.Thread")



// Intercept _exit
Interceptor.replace(Module.findExportByName(null, "_exit"), new NativeCallback(function (code) {
    console.log("[+] _exit intercepted!");
    console.log("_exit called with code: " + code);
    var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE);
    console.log("Stack trace:\n" + backtrace.map(DebugSymbol.fromAddress).join("\n"));
}, 'void', ['int']));
console.log(`[+] Hooked (replace) _exit`);


var exitFunctions = ['exit', 'abort','__libc_android_abort'];
exitFunctions.forEach(function (funcName) {
    var func = Module.findExportByName(null, funcName);
    if (func) {
        Interceptor.replace(func, new NativeCallback(function (code) {
            console.log(`[+] ${funcName} prevented! Code: ${code} \n`);
            return; // Prevent the function from terminating the app
        }, 'void', ['int']));
        console.log(`[+] Hooked replace ${funcName}`);
    } else {
        console.log(`[-] ${funcName} not found`);
    }

});

var syscall = Module.findExportByName(null, "syscall");
Interceptor.attach(syscall, {
    onEnter: function (args) {
        //console.log("[+] SYSCALL \n");
        var syscallNumber = args[0].toInt32();
        if (syscallNumber === 60) { // 60 is the syscall number for `exit` on x86_64
            console.log("[+] Syscall exit prevented! Code: " + args[1].toInt32());
            args[1] = ptr(0); // Optionally modify the exit code
        }
    }
});
console.log("[+] syscall Attached")


Interceptor.attach(Module.findExportByName(null, "raise"), {
    onEnter: function (args) {
        var signal = args[0].toInt32();
        if (signal === 5) { // SIGTRAP
            console.log("Intercepted SIGTRAP via raise(). Preventing it.");
            args[0] = ptr(0); // Replace signal with harmless one
        }
    }
});
console.log("[+] raise Attached")

Interceptor.attach(Module.findExportByName(null, "kill"), {
    onEnter: function (args) {
        console.log("kill called. PID: " + args[0].toInt32() + ", Signal: " + args[1].toInt32());
        console.log(Thread.backtrace(this.context, Backtracer.FUZZY).map(DebugSymbol.fromAddress).join("\n"));
    }
});
console.log("[+] kill Attached")


Interceptor.attach(Module.findExportByName(null, "sigaction"), {
    onEnter: function (args) {
        var signal = args[0].toInt32();
        console.log("sigaction intercepted for signal: " + signal);

        if (signal === 5) { // SIGTRAP
            console.log("Replacing SIGTRAP handler with no-op");
            Memory.writePointer(args[1], ptr("0")); // Replace handler with no-op
        }
    }
});
console.log("[+] sigaction Attached")


Java.perform(function () {
    var Activity = Java.use('android.app.Activity');
    Activity.finish.overload().implementation = function () {
        console.log("[+] finish() prevented!");
        // Do nothing to prevent the app from closing
    };
    Activity.finish.overload('int').implementation = function (i) {
        console.log("[+] finish() prevented!");
        // Do nothing to prevent the app from closing
    };
    Activity.finishAffinity.implementation = function () {
        console.log("[+] finishAffinity() prevented!");
        // Do nothing to prevent the app from closing
    };

    Activity.finishAndRemoveTask.implementation = function () {
        console.log("[+] finishAndRemoveTask() prevented!");
        // Do nothing to prevent the app from closing
    };

    console.log("[+] Java.perform Activity exit methods");
});
console.log("[+] 'android.app.Activity.finish (and derivates) attached")


Java.perform(function () {
    Java.use("android.app.Application").onTerminate.implementation = function () {
        console.log("Application.onTerminate called");
        console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
        this.onTerminate();
    };
});
console.log("[+] Java.perform android.app.Application.onTerminate")


