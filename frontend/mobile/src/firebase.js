import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  //firebase keys here
};

// Enable App Check debug token in local development environment
if (__DEV__) {
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Initialize Firebase and Auth services with AsyncStorage persistence
const app = initializeApp(firebaseConfig);

export const auth = typeof getReactNativePersistence === 'function'
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db = getFirestore(app);

// Use ReCaptchaV3Provider only on web. On native runtimes (iOS/Android), use CustomProvider
// to avoid reference errors to the web DOM (document / window).
const provider = Platform.OS === 'web'
  ? new ReCaptchaV3Provider('')
  : new CustomProvider({
    getToken: () => {
      return Promise.resolve({
        token: 'debug-token-placeholder',
        expireTimeMillis: Date.now() + 3600000
      });
    }
  });

// Initialize App Check
export const appCheck = initializeAppCheck(app, {
  provider,
  isTokenAutoRefreshEnabled: true
});




