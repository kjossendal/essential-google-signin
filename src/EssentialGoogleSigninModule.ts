import { NativeModule, requireNativeModule } from 'expo';

import { EssentialGoogleSigninModuleEvents } from './EssentialGoogleSignin.types';

declare class EssentialGoogleSigninModule extends NativeModule<EssentialGoogleSigninModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EssentialGoogleSigninModule>('EssentialGoogleSignin');
