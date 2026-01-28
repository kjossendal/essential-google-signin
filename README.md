# essential-google-signin

Native Google Sign-In for Expo using Android Credential Manager and iOS GoogleSignIn SDK.

This package provides a simple, modern implementation of Google authentication for React Native apps built with Expo. It uses the latest Android Credential Manager API and the official Google Sign-In SDK for iOS.

## Features

- ✅ Native Google Sign-In for **Android and iOS**
- ✅ Uses Android Credential Manager (modern, recommended approach)
- ✅ Uses GoogleSignIn SDK for iOS
- ✅ Automatic configuration via Expo config plugin
- ✅ ID token verification on Android
- ✅ TypeScript support
- ✅ Sign out functionality
- ⚠️ **Web platform not supported** (native SDKs only)

## Platform Support

| Platform | Supported | Implementation         |
| -------- | --------- | ---------------------- |
| iOS      | ✅ Yes    | GoogleSignIn SDK       |
| Android  | ✅ Yes    | Credential Manager API |
| Web      | ❌ No     | Native only            |

## Installation

```bash
npm install essential-google-signin
```

or

```bash
yarn add essential-google-signin
```

## Prerequisites

Before using this library, you need to set up Google Sign-In credentials in the Google Cloud Console:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity Services)

### 2. Create OAuth 2.0 Credentials

You'll need to create **three** different OAuth 2.0 client IDs (all three are required):

#### Android Client ID

1. In Google Cloud Console, go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Select **Android** as application type
4. Enter your package name (e.g., `com.yourcompany.yourapp`)
5. Get your SHA-1 certificate fingerprint:
   ```bash
   # For debug builds
   cd android
   ./gradlew signingReport
   # Look for SHA1 under "Variant: debug"
   ```
6. Save the Client ID (format: `xxx-xxx.apps.googleusercontent.com`)

#### iOS Client ID

1. Create another OAuth 2.0 Client ID
2. Select **iOS** as application type
3. Enter your iOS bundle identifier (e.g., `com.yourcompany.yourapp`)
4. Save the Client ID (format: `xxx-xxx.apps.googleusercontent.com`)

#### Web Client ID - **Required**

> ⚠️ **Important**: Despite the name, the "Web Client ID" is **required for Android** and backend token verification. It's not related to web platform support.

1. Create one more OAuth 2.0 Client ID
2. Select **Web application** as application type
3. Save the Client ID (format: `xxx-xxx.apps.googleusercontent.com`)

**Why it's needed:**

- Android Credential Manager requires a web client ID to generate OAuth tokens
- Backend servers use this to verify ID tokens
- It's a requirement of Google's OAuth flow, not for web platform support

## Configuration

### Add the plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "essential-google-signin",
        {
          "androidClientId": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
          "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
          "webClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
        }
      ]
    ]
  }
}
```

> **Note:** If you're developing this package locally (not installing from npm), use the file path instead:
>
> ```json
> "plugins": [
>   [
>     "./node_modules/essential-google-signin/src/plugin/withGoogleSigning.js",
>     { /* config */ }
>   ]
> ]
> ```

### Run prebuild

After adding the plugin, run prebuild to apply the configuration:

```bash
npx expo prebuild
```

This will:

- Add the client IDs to `AndroidManifest.xml` (Android)
- Add the client ID and URL scheme to `Info.plist` (iOS)
- Configure iOS AppDelegate for OAuth callbacks
- Set up Google Sign-In session restoration

## Usage

### Basic Example

```typescript
import EssentialGoogleSignin from 'essential-google-signin';
import { useEffect, useState } from 'react';
import { Button, Platform, Text, View } from 'react-native';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Skip on web (native only)
    if (Platform.OS === 'web') return;

    // Configure on app start
    EssentialGoogleSignin.configure()
      .then(config => console.log('Configured:', config))
      .catch(error => console.error('Configuration error:', error));
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await EssentialGoogleSignin.signIn();
      console.log('Sign in successful:', result);
      setUser(result.data);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await EssentialGoogleSignin.signOut();
      setUser(null);
      console.log('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {user ? (
        <>
          <Text>Welcome, {user.name}!</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <Button title="Sign In with Google" onPress={handleSignIn} />
      )}
    </View>
  );
}
```

## API Reference

### Methods

#### `configure(): Promise<ConfigureResult>`

Configures Google Sign-In by reading client IDs from native configuration.

**Returns:**

```typescript
{
  webClientId?: string;      // Web client ID (Android always, iOS optional)
  androidClientId?: string;  // Android only
  iosClientId?: string;      // iOS only
}
```

**Throws:**

- `CONFIG_ERROR` - If client IDs are not found in native configuration

**Note:** You must call this before `signIn()`.

---

#### `signIn(): Promise<GoogleSignInResult>`

Initiates the Google Sign-In flow and returns user data.

**Returns:**

```typescript
{
  success: true;
  data: {
    id: string;              // Google user ID
    email: string;           // User's email
    emailVerified: boolean;  // Email verification status
    name: string;            // Full name
    givenName: string;       // First name
    familyName: string;      // Last name
    pictureUrl: string;      // Profile picture URL
    locale?: string;         // User's locale (Android only)
    idToken: string;         // JWT ID token for backend verification
  }
}
```

**Throws:**

- `CONFIG_ERROR` - If `configure()` hasn't been called
- `SIGN_IN_ERROR` - If sign-in fails or user cancels
- `TOKEN_ERROR` - If token verification fails (Android)
- `CREDENTIAL_ERROR` - If credential type is unexpected

---

#### `signOut(): Promise<void>`

Signs out the current user.

**Returns:** `Promise<void>`

---

#### `hasPlayServices(): Promise<boolean>`

Checks if Google Play Services is available (Android only).

**Returns:**

- `true` if Google Play Services is available (Android) or always `true` on iOS
- `false` if Google Play Services is not available (Android only)

**Note:** On iOS, this always returns `true` as it doesn't require Play Services.

---

### Types

```typescript
type GoogleUserData = {
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

type GoogleSignInResult = {
  success: true;
  data: GoogleUserData;
};

type ConfigureResult = {
  webClientId: string;
  androidClientId?: string;
  iosClientId?: string;
};
```

## Platform-Specific Behavior

### Android

- Uses **Credential Manager API** (modern replacement for deprecated GoogleSignInClient)
- Verifies ID tokens server-side using Google's verification library
- Requires Google Play Services to be installed
- Supports Android 7.0 (API 24) and above
- Uses SHA-256 nonce for enhanced security

### iOS

- Uses **GoogleSignIn SDK** (official library from Google)
- Handles OAuth callback URLs automatically via AppDelegate
- Restores previous sign-in state on app launch
- Supports iOS 14.0 and above

## Troubleshooting

### Android: "Cannot find a matching credential"

This error typically means the SHA-1 fingerprint in Google Cloud Console doesn't match your app's signing certificate.

**Solution:**

1. Get your SHA-1 fingerprint:
   ```bash
   cd android && ./gradlew signingReport
   ```
2. Add it to your OAuth 2.0 Client ID in Google Cloud Console
3. Make sure you're using the correct package name

### Android: "BAD_AUTHENTICATION" or "Long live credential not available"

This error means the web client ID is incorrect or the OAuth configuration is wrong.

**Solution:**

- Verify the `webClientId` in your `app.json` matches the **Web** Client ID from Google Cloud Console (not Android or iOS)
- Ensure you've added the SHA-1 fingerprint for your signing certificate
- Run `npx expo prebuild --clean` after changing the config

### iOS: "Your app is missing support for the following URL schemes"

This means the URL scheme isn't properly configured in Info.plist.

**Solution:**

- Run `npx expo prebuild --clean` to regenerate native projects
- Verify the URL scheme in Info.plist matches: `com.googleusercontent.apps.{YOUR_IOS_CLIENT_ID_PREFIX}`
- The config plugin should handle this automatically

### "Google Sign-In is not configured. Call configure() first."

**Solution:**

- Make sure you call `configure()` before `signIn()`
- Ensure your client IDs are properly set in `app.json`
- Verify that `npx expo prebuild` was run after adding the plugin

### iOS: App crashes on launch after adding the module

**Solution:**

- Make sure GoogleSignIn pod is properly installed: `cd ios && pod install`
- Clean build: `npx expo run:ios --clean`

### Web: Module doesn't load or useEffect doesn't run

This module only works on **native platforms (iOS and Android)**. Web is not supported because it uses platform-specific native SDKs.

**Solution:**

Use platform detection to skip on web:

```typescript
import { Platform } from "react-native";

useEffect(() => {
  if (Platform.OS === "web") {
    console.log("Google Sign-In not available on web");
    return;
  }

  // Your Google Sign-In code here
}, []);
```

For web support, you'd need to integrate Google's JavaScript SDK separately.

## Backend Verification

The ID token returned from `signIn()` should be verified on your backend server for security:

### Node.js Example

```javascript
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(YOUR_WEB_CLIENT_ID);

async function verifyToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: YOUR_WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload["sub"];

    // You can now trust these values:
    // - payload.email
    // - payload.name
    // - payload.picture

    return {
      userId,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
}
```

### Python Example

```python
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            YOUR_WEB_CLIENT_ID
        )

        user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']

        return {
            'user_id': user_id,
            'email': email,
            'name': name
        }
    except ValueError:
        raise Exception('Invalid token')
```

## Development

To work on this module locally:

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Run example app
cd example
npx expo prebuild
npx expo run:android
npx expo run:ios
```

## Project Structure

```
essential-google-signin/
├── android/                 # Android native module
│   ├── build.gradle        # Android dependencies
│   └── src/main/java/      # Kotlin source files
├── ios/                    # iOS native module
│   ├── *.swift            # Swift source files
│   └── *.podspec          # CocoaPods spec
├── src/                   # TypeScript/JavaScript source
│   ├── index.ts           # Main export
│   ├── *.types.ts         # TypeScript types
│   └── plugin/            # Expo config plugin
├── example/               # Example app for testing
└── package.json
```

## Why This Package?

- **Modern APIs**: Uses the latest Android Credential Manager instead of deprecated GoogleSignInClient
- **Simple Setup**: Automatic configuration via Expo config plugin
- **Secure**: Includes server-side ID token verification on Android
- **Well-Typed**: Full TypeScript support with proper types
- **Maintained**: Built for Expo SDK 52+ with React Native's new architecture support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Kevin Jossendal - [@kjossendal](https://github.com/kjossendal)
