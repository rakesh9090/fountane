import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParameterList } from '../navigation/AppNavigator';
import { googleAuthService } from '../services/googleAuthService';
import { useAuthStore } from '../store/authStore';
import { otpServices } from '../services/otpServices';

type Props = NativeStackScreenProps<
  RootStackParameterList,
  'Login'
>;

const LoginScreen = ({ navigation }: Props) => {
  const [identifier, setIdentifier] = useState('');

  const login = useAuthStore(
    state => state.login
  );

  const isValidIdentifier = (value: string) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const phoneRegex =
    /^[0-9]{10}$/;

  return (
    emailRegex.test(value) ||
    phoneRegex.test(value)
  );
};

  const handleOtpLogin = () => {
  if (!isValidIdentifier(identifier)) {
    Alert.alert(
      'Invalid Input',
      'Enter a valid email or phone number'
    );
    return;
  }

  try {
    const response =
      otpServices.sendOtp(identifier);

    console.log('Generated OTP:',response.otp);

    navigation.navigate('OtpInput', {
      identifier, otp: response.otp
    });
  } catch (error) {
    Alert.alert(
      'Error',
      error instanceof Error
        ? error.message
        : 'Unknown Error'
    );
  }
};

  const handleGoogleLogin = async () => {
    try {
      const result =
        await googleAuthService.login();

      login(
        result.user,
        result.token
      );
    } catch (error) {
      Alert.alert(
        'Google Login Failed',
        error instanceof Error
          ? error.message
          : 'Unknown Error'
      );
    }
  };

  return (
    <View style={styles.container}>
     <TextInput
  accessibilityLabel="Email or phone input"
  value={identifier}
  onChangeText={setIdentifier}
  placeholder="Email or Phone"
  style={styles.userName}
/>

      <Pressable
        style={styles.buttonStyle}
        onPress={handleOtpLogin}
      >
        <Text style={styles.buttonText}>
          Login with OTP
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.buttonStyle,
          { marginTop: 16 },
        ]}
        onPress={handleGoogleLogin}
      >
        <Text style={styles.buttonText}>
          Continue with Google
        </Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c5bfbf',
    width: 250,
  },
  buttonStyle: {
    backgroundColor: '#467fd4',
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
  },
});