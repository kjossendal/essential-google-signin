import { ExpoConfig } from "expo/config";

export default function config({ config }: { config: ExpoConfig }): ExpoConfig {
  return {
    ...config,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jossendal.essentialgooglesignin.example",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.jossendal.essentialgooglesignin.example",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "../src/plugin/withGoogleSigning.js",
        {
          androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
          iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
          webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        },
      ],
    ],
  };
}
