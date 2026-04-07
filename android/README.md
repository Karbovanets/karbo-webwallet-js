## Karbo Mobile (Android)

To build the APK, you'll need:

Install Android Studio from https://developer.android.com/studio

During setup, install the Android SDK (API 35 recommended)

Then run:
```
npm run android:build    # compiles TS + syncs web assets
npm run android:open     # opens project in Android Studio
```

In Android Studio: *Build > Build Bundle(s) / APK(s) > Build APK(s)*

Or to build from command line (after Android Studio installs the SDK):
```
cd android
./gradlew assembleDebug
```

The debug APK will be at android/app/build/outputs/apk/debug/app-debug.apk.