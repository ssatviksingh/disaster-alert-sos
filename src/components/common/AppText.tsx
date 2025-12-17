import React from "react";
import { Text, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme/useTheme";

type Props = {
  children: React.ReactNode;
  variant?:
    | "title"
    | "subtitle"
    | "label"
    | "small"
    | "body";
  muted?: boolean;
  style?: any;
  numberOfLines?: number;
};

const AppText: React.FC<Props> = ({
  children,
  variant = "body",
  muted = false,
  style,
  numberOfLines,
}) => {
  const theme = useAppTheme();

  const baseStyle = {
    color: muted ? theme.textSecondary : theme.textPrimary,
    fontSize: getFontSize(variant, theme.fontScale),
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[baseStyle, style]}
    >
      {children}
    </Text>
  );
};

const getFontSize = (variant: string, scale: number) => {
  const sizes = {
    title: 22,
    subtitle: 18,
    label: 14,
    small: 13,
    body: 15,
  };
  return sizes[variant] * scale;
};

export default AppText;
