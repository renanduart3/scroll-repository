# Faith Scroll

This repository contains the Faith Scroll web application built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui components. The project is now configured to ship as a Capacitor application so it can be bundled for the Google Play Store.

## Requirements

- Node.js 18+
- npm 9+
- Java 17 (for the Android build tools)
- Android Studio (recommended for running and signing the native project)

## Installing dependencies

```sh
npm install
```

## Web development server

```sh
npm run dev
```

## Capacitor & Android workflow

The project is preconfigured with Capacitor 7. The Capacitor app id is `com.faithscroll.app`, which satisfies Play Store requirements. The Android project is generated locally (it is no longer tracked in git to avoid binary files that block PR creation).

### First-time Android setup

```sh
npx cap add android
```

This command scaffolds the `android/` folder using Capacitor's tooling. Run it once per machine or whenever you need to regenerate the native shell.

### Syncing web assets into the native project

```sh
npm run android:sync
```

This command builds the production web bundle and copies it into the generated Android project (`android/app/src/main/assets/public`). Run it any time the web code changes. If the platform has not been added yet, run `npx cap add android` first.

### Using the live development server in a device/emulator

When you want to point the native shell to a live web server during development, set the `CAP_DEV_SERVER_URL` environment variable before syncing. Example:

```sh
export CAP_DEV_SERVER_URL="http://YOUR_LOCAL_IP:5173"
npm run android:sync
```

The debug build allows HTTP traffic so you can use a non-HTTPS dev server, while release builds remain locked to the bundled assets.

### Opening the Android project

```sh
npx cap open android
```

This launches Android Studio so you can run or debug the application on an emulator or connected device.

### Generating a Play Store artifact (AAB)

1. Ensure you have created or imported a signing key (Android Studio > Build > Generate Signed App Bundle).
2. Run the bundle build:

   ```sh
   npm run android:build
   ```

   > On Windows, run `npm run android:sync` and then execute `gradlew.bat bundleRelease` from the `android` directory.

3. The unsigned bundle is generated at `android/app/build/outputs/bundle/release/app-release.aab`.
4. Use Android Studio's signing wizard or the `jarsigner`/`bundletool` CLI to sign the bundle with your Play Store key.
5. Upload the signed `.aab` in the Google Play Console once your publisher account is ready.

## Notes about the Play Store

- You must create a Google Play developer account before you can upload the release bundle.
- Review the Play Store launch checklist for app content requirements (privacy policy, screenshots, content rating, etc.).
- Create application icons and adaptive icon assets before submitting. Replace the default icons located in `android/app/src/main/res/mipmap-*`.

## Additional npm scripts

- `npm run cap:sync` – Sync all Capacitor platforms.
- `npm run android:init` – Generate the Android platform locally (run once per machine).
- `npm run android:sync` – Build the web bundle and sync it into the Android project.
- `npm run android:build` – Generate an Android App Bundle (requires the Android SDK and Java 17).

## Resources

- [Capacitor documentation](https://capacitorjs.com/docs)
- [Android app signing](https://developer.android.com/studio/publish/app-signing)
- [Play Console onboarding guide](https://support.google.com/googleplay/android-developer/answer/9859152)
