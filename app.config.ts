import { ExpoConfig } from "expo/config";

export default function config({ config }: { config: ExpoConfig }): ExpoConfig {
  return {
    ...config,
    name: "essential-google-signin",
    android: {
      package: "com.jossendal.essentialgooglesignin",
    },
    ios: {
      bundleIdentifier: "com.jossendal.essentialgooglesignin",
    },
    plugins: ["./src/plugin/withGoogleSigning.js"],
  };
}
