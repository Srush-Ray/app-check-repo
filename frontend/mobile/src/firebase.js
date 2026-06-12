import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  //copy from firebase
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

// Initialize App Check (ReCaptchaV3 site key is bypassed when FIREBASE_APPCHECK_DEBUG_TOKEN is active)
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ld_placeholder_key_for_appcheck_debug_bypass'),
  isTokenAutoRefreshEnabled: true
});



