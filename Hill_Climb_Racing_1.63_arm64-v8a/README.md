Warning: apks and ghidra project are not included beacuse of github file size limits.

## Description
Most of the game runs in libgame.so, although some changes can be made from the smali code, but it is not recommended.  
Use Frida to observe what gets written to the shared preferences (key, value) when purchasing.  
Open libgame.so in Ghidra and search for strings corresponding to the key obtained earlier, then modify the saved values.  
For paint buckets, it was easier, modifying InAppPurchaseStore.smali that was found after decompiling the APK. Same for disabling ads.  
Steps to replicate: Open the game with Frida running, inject android-sharedpreferences-observer.js into the PID corresponding to the game, and analyze the shared preferences.  
Decompile the APK, open lib/libgame.so in Ghidra, and replace the values assigned to the keys obtained with Frida.  

## Download

Modded apk: 
https://gofile.io/d/A1CjDj

## Pictures

### Viewing calls to set sharedPreferences, with keys and values
![alt text](https://github.com/DRVR1/AndroidGameHacking/blob/main/Hill_Climb_Racing_1.63_arm64-v8a/Pictures/frida_sharedpreferences_script.png)
### Modifying those default calls in ghidra (these are called when the game starts)
![alt text](https://github.com/DRVR1/AndroidGameHacking/blob/main/Hill_Climb_Racing_1.63_arm64-v8a/Pictures/ghidra_sharedpreferencesDefaults_libgame.so.png)
### Editing .smali files to make other changes like adding paints buckets to your inventory
![alt text](https://github.com/DRVR1/AndroidGameHacking/blob/main/Hill_Climb_Racing_1.63_arm64-v8a/Pictures/smaliEditingForPaintsItems.png)
