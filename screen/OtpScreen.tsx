import { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { RouteProp } from '@react-navigation/native';

import { RootStackParameterList } from '../navigation/AppNavigator';
import { otpServices } from '../services/otpServices';
import { useAuthStore } from '../store/authStore';

type OtpScreenRouteProps = RouteProp<
  RootStackParameterList,
  'OtpInput'
>;

type Props = {
  route: OtpScreenRouteProps;
};

const OtpScreen = ({ route }: Props) => {
  const { identifier, otp: generatedOtp } = route.params;
  const [seconds, setSeconds] = useState(60);
  const setLoading = useAuthStore(state => state.setLoading);

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const refs = useRef<Array<TextInput | null>>([]);

  const login = useAuthStore(
    state => state.login
  );

  const handleChange = (
    text: string,
    index: number
  ) => {
    const newOtp = [...otp];

    newOtp[index] = text;

    setOtp(newOtp);

    if (text && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (
    key: string,
    index: number
  ) => {
    if (
      key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      refs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
  if (seconds <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setSeconds(prev => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [seconds]);

  const handleVerify = () => {
  try {
    setLoading(true);

    const enteredOtp = otp.join('');

    const result =
      otpServices.verifyOtp(
        identifier,
        enteredOtp
      );

    login(
      {
        id: Date.now().toString(),
        name: 'Demo User',
        email: identifier,
      },
      result.token
    );
  } catch (error) {
    Alert.alert(
      'Verification Failed',
      error instanceof Error
        ? error.message
        : 'Unknown Error'
    );
  } finally {
    setLoading(false);
  }
};

const handleResendOtp = () => {
  try {
    otpServices.resendOtp(identifier);

    setSeconds(60);
  } catch (error) {
    Alert.alert(
      'Resend Failed',
      error instanceof Error
        ? error.message
        : 'Unknown Error'
    );
  }
};

  return (
    <View style={styles.containerMain}>
      <Text style={styles.title}>
        Enter OTP
      </Text>

      <Text style={styles.subtitle}>
        Sent to {identifier}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              refs.current[index] = ref;
            }}
            value={digit}
            onChangeText={text =>
              handleChange(text, index)
            }
            onKeyPress={({ nativeEvent }) =>
              handleBackspace(
                nativeEvent.key,
                index
              )
            }
            keyboardType="number-pad"
            maxLength={1}
            style={styles.box}
            textAlign="center"
          />
        ))}
      </View>

      <Pressable
       accessibilityLabel="Verify OTP"
        style={styles.buttonStyle}
        onPress={handleVerify}
      >
        <Text style={styles.textStyle}>
          Verify OTP
        </Text>
      </Pressable>
      {seconds > 0 ? (
  <Text
    style={{
      marginTop: 20,
    }}
  >
    Resend OTP in {seconds}s
  </Text>
) : (
  <Pressable
    onPress={handleResendOtp}
  >
    <Text
      style={{
        marginTop: 20,
        color: 'blue',
      }}
    >
      Resend OTP
    </Text>
  </Pressable>
)}

<Text style={styles.demoOtp}>
  Mock OTP (for evaluation): {generatedOtp}
</Text>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },

  subtitle: {
    marginBottom: 24,
  },

  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  box: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
  },

  buttonStyle: {
    backgroundColor: '#5b5bc7',
    borderRadius: 10,
    padding: 12,
    minWidth: 120,
    alignItems: 'center',
  },

  textStyle: {
    color: 'white',
    fontSize: 14,
  },
  demoOtp: {
  marginTop: 20,
  fontSize: 16,
  fontWeight: '600',
  color: 'red',
},
});