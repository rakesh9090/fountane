import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screen/HomeScreen';
import LoginScreen from '../screen/LoginScreen';
import OtpScreen from '../screen/OtpScreen';
import { useAuthStore } from '../store/authStore';

export type RootStackParameterList = {
  Login: undefined;
  OtpInput: {
    identifier: string;
    otp: string;
  };
  Home: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParameterList>();

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore(
    state => state.isAuthenticated
  );

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            name="OtpInput"
            component={OtpScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};