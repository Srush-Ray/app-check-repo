import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
import { login, logout, selectUser } from './src/redux/userSlice';
import { getMockCurrentUser, mockLogout } from './src/data/mockData';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import HomeScreen from './src/pages/HomeScreen';
import LoginScreen from './src/pages/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

function AppContent() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const loggedInUser = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        };
        dispatch(login(loggedInUser));
      } else {
        // Fallback: Check if there's a simulated Google user session in AsyncStorage
        getMockCurrentUser().then((mockUser) => {
          if (mockUser) {
            dispatch(login(mockUser));
          } else {
            dispatch(logout());
          }
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        mockLogout().then(() => {
          dispatch(logout());
        });
      })
      .catch((error) => {
        console.error("Firebase SignOut error:", error);
      });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#dee2e6',
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: '#212529',
          },
        }}
      >
        {user ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={() => ({
              title: 'Home',
              headerRight: () => (
                <View style={styles.headerRight}>
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {user.displayName || user.email}
                  </Text>
                  <TouchableOpacity
                    style={[styles.headerBtn, styles.logoutBtn]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.logoutBtnText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Login',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  userNameText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginRight: 10,
    maxWidth: 150,
  },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutBtn: {
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  logoutBtnText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
});
