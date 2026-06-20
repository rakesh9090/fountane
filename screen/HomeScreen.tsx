import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuthStore } from '../store/authStore';

const HomeScreen = () => {
  const user = useAuthStore(
    state => state.user
  );

  const token = useAuthStore(
    state => state.token
  );

  const logout = useAuthStore(
    state => state.logout
  );

  return (
    <View style={styles.container}>
      <Text>
        Welcome {user?.name}
      </Text>

      <Text>
        Email: {user?.email}
      </Text>

      <Text>
        Token: {token}
      </Text>

      <Pressable
        style={styles.button}
        onPress={logout}
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    marginTop: 24,
    backgroundColor: '#467fd4',
    padding: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: 'white',
  },
});