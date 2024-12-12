java -jar apktool_2.10.0.jar b output -o compiled.apk
zipalign -v 4 compiled.apk compiledAligned.apk
apksigner sign --ks my-release-key.jks --out compiledAS.apk compiledAligned.apk
adb install compiledAS.apk
rm compiledAligned.apk
rm compiled.apk
