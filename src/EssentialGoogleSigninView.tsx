import { requireNativeView } from 'expo';
import * as React from 'react';

import { EssentialGoogleSigninViewProps } from './EssentialGoogleSignin.types';

const NativeView: React.ComponentType<EssentialGoogleSigninViewProps> =
  requireNativeView('EssentialGoogleSignin');

export default function EssentialGoogleSigninView(props: EssentialGoogleSigninViewProps) {
  return <NativeView {...props} />;
}
