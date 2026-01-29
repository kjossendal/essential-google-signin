# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-27

### Fixed
- Added `app.plugin.js` in package root for proper Expo plugin discovery
- Fixed plugin parameter destructuring error with better validation
- Added helpful error messages when plugin configuration is missing
- Fixed iOS main thread warning by using `DispatchQueue.main.async`
- Fixed iOS `signOut()` method (was incorrectly async, now synchronous)
- Removed unnecessary `webClientId` from iOS (only used on Android)

### Changed
- Improved plugin error messages with configuration examples
- Bumped iOS minimum version to 14.0 (from 13.0)
- Bumped Swift version to 5.9 (from 5.4)
- Bumped Android target SDK to 35 (from 34)
- Bumped Android min SDK to 24 (from 21)

### Removed
- Removed unused view components (EssentialGoogleSigninView)
- Removed example/boilerplate code (PI constant, hello function, etc.)
- Removed empty AndroidManifest.xml
- Cleaned up all commented code

## [0.1.0] - 2025-01-27

### Added
- Initial release of essential-google-signin
- Native Google Sign-In for Android using Credential Manager API
- Native Google Sign-In for iOS using GoogleSignIn SDK
- Expo config plugin for automatic native configuration
- TypeScript support with full type definitions
- Functions: `configure()`, `signIn()`, `signOut()`, `hasPlayServices()`
- ID token verification on Android
- Automatic session restoration on iOS
- Support for Android 7.0+ (API 24)
- Support for iOS 14.0+

### Features
- **Android**: Modern Credential Manager API integration
- **iOS**: Official GoogleSignIn SDK integration
- **Config Plugin**: Automatic setup of AndroidManifest.xml and Info.plist
- **Security**: Server-side token verification on Android
- **Documentation**: Comprehensive README with setup instructions

[0.1.0]: https://github.com/kjossendal/essential-google-signin/releases/tag/v0.1.0
