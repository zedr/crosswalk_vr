default: build

build: clean
	crosswalk-pkg app
	adb install -r com.zedr.cordova_xw_vr-?.?-debug.armeabi-v7a.apk

clean:
	@rm *apk
