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
