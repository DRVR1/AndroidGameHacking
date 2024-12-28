# Author: Ian Vidmar
# Description: Inyect a frida-gadget entry into a native lib. 

# Configure:
native_lib_name = 'libgdx.so'
frida_gadget_name = 'libfarm64.so'
frida_gadget_config_name = 'libfarm64.config.so'


import os
import lief

print("\nWelcome.\nThis script its meant to inyect a frida-gadget.so file entry into a native lib of the taget app.\n")

input(f"A new entry will be added in {native_lib_name}\nNative library name (target): {native_lib_name}\nFrida gadget name: {frida_gadget_name}\nFrida configuration file name (optional): {frida_gadget_config_name}\nIs this info correct? (if not, change the values in this script)\nInput: ")
libnative = lief.parse(native_lib_name)
libnative.add_library(frida_gadget_name)
libnative.write(native_lib_name)
try:
    print("Checking if the inyection was sucessful...\n")
    os.system(f'readelf -d {native_lib_name}')
    print(f"There should be a frida entry: {frida_gadget_name}\n")
except:
    print(f"could not check if {native_lib_name} was inyected correctly\n")
print(f"Done, remember to leave {frida_gadget_name} next to {native_lib_name} so it can be run correctly.")

description = '''
Common Use Cases

Setting up hooks: Define which functions or libraries should be hooked and how.
Loading custom scripts: Specify JavaScript or Python scripts to be run when the app starts
Controlling Frida's behavior: Configure options like log levels, debugging, or paths.
'''

template_script = '''
{
    "interaction": {
        "type": "script",
        "path": "/data/local/tmp/myScript.js"
    }
}
'''
def askConfigFile():
    a = int(input("Do you want to create a configuration file for frida?\n1. Yes\n2. No\n3. What is that?\nInput: "))
    if(a==1):
        #create default config file
        try:
            print(f"Creating file: {frida_gadget_config_name}\nContent:\n{template_script}")
            with open(frida_gadget_config_name,'w') as f:
                f.write(template_script)
            print('In this case, when the app opens, frida-gadget will search for the script located in the tmp folder, and run it automatically')
        except:
            print(f"Error creating the configuration file '{frida_gadget_config_name}', please create it manually. Here is the template:\n{template_script}")
    elif(a==2):
        pass
    elif(a==3):
        print(description)
        input("continue:")
        askConfigFile()
    else:
        askConfigFile()

askConfigFile()
