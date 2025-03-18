import * as React from 'react';

import { EssentialGoogleSigninViewProps } from './EssentialGoogleSignin.types';

export default function EssentialGoogleSigninView(props: EssentialGoogleSigninViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
