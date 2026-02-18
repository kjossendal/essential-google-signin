const makeBaseConfig = () => ({
  ios: { bundleIdentifier: "com.example.app" },
  modResults: {},
});

jest.mock("@expo/config-plugins", () => ({
  withAndroidManifest: (config, action) => {
    const androidConfig = {
      ...config,
      modResults: {
        ...(config.modResults || {}),
        manifest: {
          application: [{}],
        },
      },
    };
    action(androidConfig);
    return androidConfig;
  },
  withInfoPlist: (config, action) => {
    const iosConfig = {
      ...config,
      modResults: {
        ...(config.modResults || {}),
      },
    };
    return action(iosConfig);
  },
  withAppDelegate: (config, action) => {
    const appDelegateConfig = {
      ...config,
      modResults: {
        ...(config.modResults || {}),
        contents:
          '#import <React/RCTLinkingManager.h>\n\nself.initialProps = @{};\n\n- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n  return [RCTLinkingManager application:application openURL:url options:options];\n}\n',
      },
    };
    return action(appDelegateConfig);
  },
}));

const withGoogleSignIn = require("../src/plugin/withGoogleSigning");

describe("withGoogleSigning plugin", () => {
  const validOptions = {
    androidClientId: "android-id.apps.googleusercontent.com",
    iosClientId: "1234567890-abc.apps.googleusercontent.com",
    webClientId: "web-id.apps.googleusercontent.com",
  };

  it("throws when androidClientId is missing", () => {
    expect(() =>
      withGoogleSignIn(makeBaseConfig(), {
        iosClientId: validOptions.iosClientId,
        webClientId: validOptions.webClientId,
      }),
    ).toThrow(/androidClientId/);
  });

  it("throws when iosClientId is missing", () => {
    expect(() =>
      withGoogleSignIn(makeBaseConfig(), {
        androidClientId: validOptions.androidClientId,
        webClientId: validOptions.webClientId,
      }),
    ).toThrow(/iosClientId/);
  });

  it("throws when webClientId is missing", () => {
    expect(() =>
      withGoogleSignIn(makeBaseConfig(), {
        androidClientId: validOptions.androidClientId,
        iosClientId: validOptions.iosClientId,
      }),
    ).toThrow(/webClientId/);
  });

  it("adds expected Android and iOS configuration when options are valid", () => {
    const config = withGoogleSignIn(makeBaseConfig(), validOptions);

    const manifest = config.modResults.manifest;
    const permissions = manifest["uses-permission"] || [];
    const application = manifest.application[0];
    const metadata = application["meta-data"] || [];

    expect(
      permissions.some(
        (p) => p.$["android:name"] === "android.permission.INTERNET",
      ),
    ).toBe(true);

    expect(
      metadata.find(
        (m) =>
          m.$["android:name"] === "com.google.android.gms.games.WEB_CLIENT_ID",
      ).$["android:value"],
    ).toBe(validOptions.webClientId);

    expect(
      metadata.find(
        (m) =>
          m.$["android:name"] ===
          "com.google.android.gms.games.ANDROID_CLIENT_ID",
      ).$["android:value"],
    ).toBe(validOptions.androidClientId);

    expect(config.modResults.GIDClientID).toBe(validOptions.iosClientId);
    expect(config.modResults.CFBundleURLTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          CFBundleURLSchemes: expect.arrayContaining([
            "com.googleusercontent.apps.1234567890-abc",
          ]),
        }),
      ]),
    );
  });
});

