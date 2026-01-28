import { registerWebModule, NativeModule } from "expo";

const NOT_SUPPORTED_ERROR = new Error(
  "essential-google-signin is not supported on web. " +
    "This module requires native Google Sign-In SDKs (Android Credential Manager & iOS GoogleSignIn). " +
    "Please use Platform.OS checks to skip Google Sign-In on web, or integrate Google's JavaScript SDK separately.",
);

class EssentialGoogleSigninModule extends NativeModule {
  async hasPlayServices(): Promise<boolean> {
    throw NOT_SUPPORTED_ERROR;
  }

  async configure(): Promise<never> {
    throw NOT_SUPPORTED_ERROR;
  }

  async signIn(): Promise<never> {
    throw NOT_SUPPORTED_ERROR;
  }

  async signOut(): Promise<never> {
    throw NOT_SUPPORTED_ERROR;
  }
}

export default registerWebModule(EssentialGoogleSigninModule);
