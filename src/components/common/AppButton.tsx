import React from "react";
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAppTheme } from "../../theme/useTheme";

type Props = {
  title: string;
  onPress: () => void;
  style?: any;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline"; // NEW
};

const AppButton: React.FC<Props> = ({
  title,
  onPress,
  style,
  loading = false,
  disabled = false,
  variant = "primary",
}) => {
  const theme = useAppTheme();

  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? theme.primary : "transparent",
          borderColor: theme.cardBorder,
          borderWidth: isPrimary ? 0 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : theme.textPrimary} />
      ) : (
        <Text
          style={[
            styles.title,
            {
              color: isPrimary ? "#fff" : theme.textPrimary, // 👈 FIXED HERE
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",

    // shadow for floating effect
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AppButton;
