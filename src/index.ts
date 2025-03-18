// Reexport the native module. On web, it will be resolved to EssentialGoogleSigninModule.web.ts
// and on native platforms to EssentialGoogleSigninModule.ts
export { default } from './EssentialGoogleSigninModule';
export { default as EssentialGoogleSigninView } from './EssentialGoogleSigninView';
export * from  './EssentialGoogleSignin.types';
