import { ViewProps } from "react-native";

export type GoogleUserData = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  pictureUrl: string;
  locale?: string;
  familyName: string;
  givenName: string;
  idToken: string;
};

export type GoogleSignInResult = {
  success: true;
  data: GoogleUserData;
};

export type GoogleSignOutResult = {
  success: true;
};

export type ConfigureResult = {
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
};

export type ConfigureOptions = {
  /**
   * Android only:
   * - true (default): may auto-select last/only eligible account
   * - false: always prompt account selection UI
   */
  androidAutoSelectEnabled?: boolean;
};

export type GoogleSigninButtonProps = ViewProps & {
  size?: number;
  color?: "dark" | "light";
  disabled?: boolean;
  onPress?: () => void;
};
