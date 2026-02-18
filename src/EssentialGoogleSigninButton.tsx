import { requireNativeViewManager } from "expo-modules-core";
import React from "react";
import { StyleSheet } from "react-native";

import { GoogleSigninButtonProps } from "./EssentialGoogleSignin.types";

const NativeButton = requireNativeViewManager("EssentialGoogleSignin");

export const Size = { Standard: 0, Wide: 1, Icon: 2 } as const;
export const Color = { Light: "light", Dark: "dark" } as const;

export function GoogleSigninButton({
  size = Size.Standard,
  style,
  onPress,
  ...rest
}: GoogleSigninButtonProps) {
  const sizeStyle =
    size === Size.Icon
      ? styles.icon
      : size === Size.Wide
        ? styles.wide
        : styles.standard;
  return (
    <NativeButton
      size={size}
      style={[sizeStyle, style]}
      onButtonPress={onPress}
      {...rest}
    />
  );
}

GoogleSigninButton.Color = Color;
GoogleSigninButton.Size = Size;

const styles = StyleSheet.create({
  icon: { width: 48, height: 48 },
  standard: { width: 230, height: 48 },
  wide: { width: 312, height: 48 },
});
