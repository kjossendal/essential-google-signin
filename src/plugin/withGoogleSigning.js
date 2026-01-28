const {
  withAndroidManifest,
  withAppDelegate,
  withInfoPlist,
} = require("@expo/config-plugins");

const withGoogleSignIn = (
  config,
  { androidClientId, webClientId, iosClientId },
) => {
  if (!androidClientId) {
    throw new Error(
      "androidClientId is required for Google Sign-In configuration",
    );
  }

  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add internet permission if not already present
    if (!androidManifest.manifest["uses-permission"]) {
      androidManifest.manifest["uses-permission"] = [];
    }
    if (
      !androidManifest.manifest["uses-permission"].some(
        (permission) =>
          permission.$["android:name"] === "android.permission.INTERNET",
      )
    ) {
      androidManifest.manifest["uses-permission"].push({
        $: { "android:name": "android.permission.INTERNET" },
      });
    }

    // Add Google Sign-In metadata
    const application = androidManifest.manifest.application?.[0];
    if (!application) {
      throw new Error("No application found in Android manifest");
    }

    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    // Helper function to update or add metadata
    const updateOrAddMetadata = (name, value) => {
      const existingIndex = application["meta-data"].findIndex(
        (meta) => meta.$["android:name"] === name,
      );

      if (existingIndex !== -1) {
        // Update existing metadata
        application["meta-data"][existingIndex].$["android:value"] = value;
      } else {
        // Add new metadata
        application["meta-data"].push({
          $: {
            "android:name": name,
            "android:value": value,
          },
        });
      }
    };

    // Add Google Web Client ID
    if (webClientId) {
      updateOrAddMetadata(
        "com.google.android.gms.games.WEB_CLIENT_ID",
        webClientId,
      );
    }

    // Add Google Sign-In configuration
    updateOrAddMetadata(
      "com.google.android.gms.games.ANDROID_CLIENT_ID",
      androidClientId,
    );

    return config;
  });

  // Add Google Sign-In configuration to iOS
  if (iosClientId) {
    config = withGoogleSignInIos(config, { iosClientId, webClientId });
  }

  return config;
};

const withGoogleSignInIos = (config, { iosClientId, webClientId }) => {
  if (!config.ios) {
    config.ios = {};
  }

  if (!config.ios.bundleIdentifier) {
    throw new Error(
      "iOS bundle identifier is required for Google Sign-In configuration",
    );
  }

  // Configure Info.plist with GIDClientID and URL scheme
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Add GIDClientID to Info.plist (iOS OAuth client ID)
    infoPlist.GIDClientID = iosClientId;

    // Extract the client ID part (before .apps.googleusercontent.com)
    const clientIdMatch = iosClientId.match(
      /^(.+)\.apps\.googleusercontent\.com$/,
    );
    const clientIdPart = clientIdMatch
      ? clientIdMatch[1]
      : iosClientId.split(".")[0];

    // Create reversed URL scheme: com.googleusercontent.apps.{clientId}
    const urlScheme = `com.googleusercontent.apps.${clientIdPart}`;

    // Ensure CFBundleURLTypes exists
    if (!infoPlist.CFBundleURLTypes) {
      infoPlist.CFBundleURLTypes = [];
    }

    // Check if our URL scheme already exists
    const existingUrlType = infoPlist.CFBundleURLTypes.find((urlType) =>
      urlType.CFBundleURLSchemes?.includes(urlScheme),
    );

    if (!existingUrlType) {
      // Add new URL type with our scheme
      infoPlist.CFBundleURLTypes.push({
        CFBundleURLSchemes: [urlScheme],
      });
    }

    return config;
  });

  // Add Google Sign-In code to AppDelegate
  config = withAppDelegate(config, (config) => {
    let appDelegate = config.modResults.contents;

    // Add Google Sign-In import if not present
    if (!appDelegate.includes("#import <GoogleSignIn/GoogleSignIn.h>")) {
      const importPattern = /#import <React\/RCTLinkingManager\.h>/;
      if (appDelegate.match(importPattern)) {
        appDelegate = appDelegate.replace(
          importPattern,
          `#import <React/RCTLinkingManager.h>\n#import <GoogleSignIn/GoogleSignIn.h>`,
        );
      }
    }

    // Add restorePreviousSignIn code if not already present
    if (!appDelegate.includes("restorePreviousSignInWithCompletion")) {
      const restoreSignInCode = `\n  [GIDSignIn.sharedInstance restorePreviousSignInWithCompletion:^(GIDGoogleUser * _Nullable user,
                                                                  NSError * _Nullable error) {
    if (error) {
      // Show the app's signed-out state.
    } else {
      // Show the app's signed-in state.
    }
  }];`;

      // Find self.initialProps and insert after it
      const initialPropsPattern = /(self\.initialProps = @\{\};)/;
      if (appDelegate.match(initialPropsPattern)) {
        appDelegate = appDelegate.replace(
          initialPropsPattern,
          `$1${restoreSignInCode}`,
        );
      }
    }

    // Add URL handling code to openURL method if not already present
    if (!appDelegate.includes("[GIDSignIn.sharedInstance handleURL:url]")) {
      const urlHandlingCode = `  BOOL handled;

  handled = [GIDSignIn.sharedInstance handleURL:url];
  if (handled) {
    return YES;
  }
  `;

      // Find the openURL method and add the handling code
      const openURLPattern =
        /(- \(BOOL\)application:\(UIApplication \*\)application openURL:\(NSURL \*\)url options:\(NSDictionary<UIApplicationOpenURLOptionsKey,id> \*\)options\s*\{)\s*/;
      if (appDelegate.match(openURLPattern)) {
        appDelegate = appDelegate.replace(
          openURLPattern,
          `$1\n${urlHandlingCode}`,
        );
      }
    }

    config.modResults.contents = appDelegate;
    return config;
  });

  return config;
};

module.exports = withGoogleSignIn;
