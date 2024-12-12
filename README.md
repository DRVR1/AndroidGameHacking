# Android Game Hacking Guide

### ⚠️ Note
This guide is intended solely for educational purposes to help users understand the inner workings of Android applications and improve their skills in reverse engineering. It is not intended to be used for any malicious or illegal activities. The information provided is for learning and research only.

If you are the owner of an application or the GitHub repository associated with any content in this guide and have concerns, please feel free to contact me.

I do not take responsibility for any actions taken using this guide. Users are solely responsible for how they apply the information shared here. Please ensure that you are following all applicable laws and ethical guidelines when engaging in reverse engineering activities.

### 🛠️ Tools used
- Ubuntu OS
- WayDroid (android emulator)
- Ghidra (for reversing .so files)
- Jadx (for reading app source code)
- VScode
- ApkTool

# Setting up hacking lab
Requirements: 
- A linux distro (ubuntu recommended) 
- Python (pyenv recommended)
- Basic linux and bash knowledge
- Basic android app developement knowledge (recommendable)
- Internet connection.

## Setting Up Android Virtual Machine 
To use frida for advanced reversing, you need a rooted phone. <br>
Rooting an android phone implies that the overall security will be lower, so i choosed an android virtual machine. <br>
Here are the steps for installing an android virtual machine for linux (using wayland).

#### Enable Wayland instead of X11  
- sudo nano /etc/gdm3/custom.conf  
- Set WaylandEnable=true  
#### Restart the service to apply changes  
    sudo systemctl restart gdm3
#### Log in  
- Select Wayland instead of X11 before logging into Ubuntu  
#### Confirm it is in Wayland mode  
    echo $XDG_SESSION_TYPE  
#### Installing and running waydroid:   
    sudo apt install curl ca-certificates -y  
    curl -s https://repo.waydro.id | sudo bash  
    sudo apt install waydroid -y  
    sudo waydroid -w first-launch  
#### Disable UFW in order to connect to WayDroid via ADB
    sudo ufw disable 
#### Connect ADB to Waydroid from host  
    echo "Grab Waydroid IP address from Android Settings -> About"
    adb connect <IP>:5555
    echo "example: adb connect 192.168.240.112:5555"
#### Uninstall Waydroid  
    sudo waydroid session stop 
    sudo waydroid container stop 
    sudo apt remove --purge waydroid
    sudo apt autoremove --purge
    sudo rm -rf /var/lib/waydroid
    sudo rm -rf ~/.config/waydroid
    sudo apt remove --purge waydroid-kernel

## Setting Up Apktool
    sudo apt install -y openjdk-11-jdk  # Ensure Java is installed
    echo "download apktool release https://github.com/iBotPeaches/Apktool"
    sudo apt install -y android-sdk

## Rooting WayDroid

#### Required for running ARMEABI apps (install libhoudini for ARM apps execution)  
    git clone https://github.com/casualsnek/waydroid_script
    cd cd waydroid_script/
    sudo $(pyenv which python) main.py
    echo "example: sudo /home/name/.pyenv/versions/3.13.0/bin/python main.py"
    
After executing the python script, you will find some options. Select the corresponding android version, then install libhoudini (for compatibility with other apks) and magisk (to gain root access). When magisk is installed, open it in Waydroid, go to the "Superuser" tab, and enable the shell.

## Setting Up Frida (Requires root)
    pip install frida-tools 
Download Frida for Android 
    https://apkpure.com/frida-server/me.shingle.fridaserver/downloading <br>
    Open the app, grant root access, and activate the service. 

## Some Frida useful commands
View running processes <br> 
    ```frida-ps -U```

Connect to the process with a JavaScript file <br>
    ```frida -U -p <PID> -l <filename>.js```

## Setting Up Ghidra
Download it from the NSA GitHub <br>
Run the launcher with bash 


## Reverse Engineering Process Flow (Pseudocode): 
#### Fetch and pull APK from the phone via ADB:
    path = adb shell pm path com.company.appName
    adb pull $(path) originalApp.apk
#### Decompile the APK  
    java -jar apktool.jar d input.apk -o output  
#### *Example of making changes to the .smali files by string search* 
    In VSCode: cd output/smali/com/fingersoft/game  
    grep -r "coin" 
    change required .smali code
#### Recompile the APK  
    java -jar apktool_2.10.0.jar b output -o compiled.apk  
#### Align the APK (necessary to avoid an error)  
    zipalign -v 4 compiled.apk aligned.apk  
#### Generate a key (only the first time)  
    keytool -genkeypair -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key  
#### Sign the APK with the generated key
    apksigner sign --ks my-release-key.jks --out signed.apk aligned.apk  
    apksigner verify signed.apk  
#### Install on the device  
    adb install signed.apk  



## Some Errors i had:  
    error: adb: failed to install apk: Failure [INSTALL_FAILED_INVALID_APK: INSTALL_FAILED_INVALID_APK: Failed to extract native libraries, res=-2]  
    Solution: In AndroidManifest.xml, set android:extractNativeLibs="true".  

    error: unable to run JADX with Java  
    Solution: apt-get purge openjdk*; sudo apt install default-jre  

    error: Ghidra does not recognize Java  
    Solution: sudo apt install openjdk-21-jdk  


