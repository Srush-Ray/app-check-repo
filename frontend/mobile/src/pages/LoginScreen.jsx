import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../redux/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();

  const pushUserAndNavigate = (user) => {
    dispatch(login({
      email: user.email,
      uid: user.uid,
      displayName: user.displayName,
    }));
    navigation.navigate('Home');
  };

  const handleEmailSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password cannot be empty.');
      return;
    }
    setLoading(true);
    // Format email if username is typed (e.g. test -> test@example.com)
    const formattedEmail = email.includes('@') ? email : `${email}@example.com`;
    signInWithEmailAndPassword(auth, formattedEmail, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const loggedInUser = {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || user.email.split('@')[0],
        };
        AsyncStorage.setItem('mock_portfolio_user', JSON.stringify(loggedInUser))
          .then(() => {
            pushUserAndNavigate(loggedInUser);
          });
      })
      .catch((error) => {
        let friendlyMessage = error.message;
        if (error.code === 'auth/invalid-credential') {
          friendlyMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
          friendlyMessage = 'Invalid email address format.';
        }
        Alert.alert('Login Failed', friendlyMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEmailSignUp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password cannot be empty.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    // Format email if username is typed (e.g. test -> test@example.com)
    const formattedEmail = email.includes('@') ? email : `${email}@example.com`;
    createUserWithEmailAndPassword(auth, formattedEmail, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const loggedInUser = {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || user.email.split('@')[0],
        };
        AsyncStorage.setItem('mock_portfolio_user', JSON.stringify(loggedInUser))
          .then(() => {
            pushUserAndNavigate(loggedInUser);
            Alert.alert('Success', 'Account created and logged in!');
          });
      })
      .catch((error) => {
        let friendlyMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
          friendlyMessage = 'This email address is already in use.';
        } else if (error.code === 'auth/invalid-email') {
          friendlyMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/weak-password') {
          friendlyMessage = 'Password must be at least 6 characters.';
        }
        Alert.alert('Sign Up Failed', friendlyMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    if (typeof signInWithPopup === 'function') {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          const loggedInUser = {
            email: user.email,
            uid: user.uid,
            displayName: user.displayName || user.email.split('@')[0],
          };
          AsyncStorage.setItem('mock_portfolio_user', JSON.stringify(loggedInUser))
            .then(() => {
              pushUserAndNavigate(loggedInUser);
              Alert.alert('Google Sign-In', 'Logged in successfully via Google.');
            });
        })
        .catch((error) => {
          Alert.alert('Google Sign-In Failed', error.message);
        })
        .finally(() => {
          setGoogleLoading(false);
        });
    } else {
      // Fallback for mobile environments where signInWithPopup is not supported
      setTimeout(() => {
        const mockGoogleUser = {
          email: 'google.user@example.com',
          uid: 'google-uid-' + Math.random().toString(36).substr(2, 9),
          displayName: 'Google User',
        };
        AsyncStorage.setItem('mock_portfolio_user', JSON.stringify(mockGoogleUser))
          .then(() => {
            pushUserAndNavigate(mockGoogleUser);
            Alert.alert('Google Sign-In (Simulated)', 'Google popup login is simulated on mobile devices.');
          })
          .catch((err) => {
            Alert.alert('Google Sign-In Failed', err.message);
          })
          .finally(() => {
            setGoogleLoading(false);
          });
      }, 1000);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email or username (e.g. test)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password (e.g. Test@123)"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d6efd" style={styles.loader} />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleEmailSignIn}>
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleEmailSignUp}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {googleLoading ? (
            <ActivityIndicator size="small" color="#db4437" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
              <FontAwesome name="google" size={18} color="#db4437" />
              <Text style={styles.googleButtonText}>Log in with Google</Text>
            </TouchableOpacity>
          )}

          <View style={styles.credentialsCard}>
            <Text style={styles.credentialsTitle}>Firebase Authentication Enabled:</Text>
            <Text style={styles.credentialsText}>
              Enter any email & password to Sign Up, or use existing logins.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#212529',
    backgroundColor: '#f8f9fa',
  },
  loader: {
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#6c757d',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#6c757d',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6c757d',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    height: 48,
    borderColor: '#db4437',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#db4437',
  },
  credentialsCard: {
    marginTop: 24,
    paddingTop: 16,
    borderTopColor: '#dee2e6',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  credentialsTitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  credentialsText: {
    fontSize: 13,
    color: '#6c757d',
  },
  bold: {
    fontWeight: 'bold',
    color: '#495057',
  },
});
