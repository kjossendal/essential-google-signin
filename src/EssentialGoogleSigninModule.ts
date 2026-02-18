import { NativeModule, requireNativeModule } from "expo";

import {
  GoogleSignInResult,
  ConfigureResult,
  ConfigureOptions,
  GoogleSignOutResult,
} from "./EssentialGoogleSignin.types";

declare class EssentialGoogleSigninModule extends NativeModule {
  /**
   * Checks if Google Play Services is available (Android only, always returns true on iOS)
   */
  hasPlayServices(): Promise<boolean>;

  /**
   * Configures Google Sign-In by reading client IDs from native configuration
   * On Android: reads from AndroidManifest.xml
   * On iOS: reads from Info.plist
   */
  configure(options?: ConfigureOptions): Promise<ConfigureResult>;

  /**
   * Initiates the Google Sign-In flow
   * Returns user data including profile information and ID token
   */
  signIn(): Promise<GoogleSignInResult>;

  /**
   * Signs out the current user
   */
  signOut(): Promise<GoogleSignOutResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EssentialGoogleSigninModule>(
  "EssentialGoogleSignin",
);
