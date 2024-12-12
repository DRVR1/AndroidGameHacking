Hill Climb Racing Log:  
    Most of the game runs in libgame.so, although some changes can be made from the smali code, but it is not recommended.  
    Use Frida to observe what gets written to the shared preferences (key, value) when purchasing.  
    Open libgame.so in Ghidra and search for strings corresponding to the key obtained earlier, then modify the saved values.  
    For paint buckets, it was easier, modifying InAppPurchaseStore.smali that was found after decompiling the APK. Same for disabling ads.  
    Steps to replicate: Open the game with Frida running, inject android-sharedpreferences-observer.js into the PID corresponding to the game, and analyze the shared preferences.  
    Decompile the APK, open lib/libgame.so in Ghidra, and replace the values assigned to the keys obtained with Frida.  
