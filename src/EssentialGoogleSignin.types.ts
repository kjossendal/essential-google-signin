import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type EssentialGoogleSigninModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value?: string;
  webClientId?: string;
  androidClientId?: string;
  success?: boolean;
  error?: string;
  data?: GoogleUserData;
};

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

export type ConfigureResult = {
  webClientId: string;
  androidClientId?: string;
  iosClientId?: string;
};

export type EssentialGoogleSigninViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
