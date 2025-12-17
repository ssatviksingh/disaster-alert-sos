// src/navigation/LoginStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen"; // optional onboarding

export type AuthStackParamList = {
  Login: undefined;
  Welcome?: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const LoginStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* We can Keep Welcome if we want onboarding before login */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
};

export default LoginStack;
