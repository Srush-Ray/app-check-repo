import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider, getToken } from "firebase/app-check";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
 //firebase keys here
};

// Enable App Check debug token in local development environment
if (__DEV__) {
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  if (Platform.OS === 'web') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}

// Initialize Firebase and Auth services with AsyncStorage persistence
const app = initializeApp(firebaseConfig);

export const auth = typeof getReactNativePersistence === 'function'
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db = getFirestore(app);

// Use ReCaptchaV3Provider only on web. On native rurntimes (iOS/Android), use CustomProvider
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

// Force-trigger App Check token retrieval on startup for development web.
// This forces the Debug Provider to run, generate/retrieve the debug token,
// log it to the console, and persist it in LocalStorage immediately.
if (Platform.OS === 'web' && __DEV__) {
  getToken(appCheck)
    .then(() => {
      try {
        // Firebase stores the debug token in local storage under a key starting with _fire_appcheck_dbt
        let debugToken = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('_fire_appcheck_dbt')) {
            debugToken = localStorage.getItem(key);
            break;
          }
        }
        if (debugToken) {
          console.log("=========================================");
          console.log("APP CHECK DEBUG TOKEN (for Firebase Console):");
          console.log(debugToken);
          console.log("=========================================");
        }
      } catch (e) {
        console.warn("Failed to retrieve App Check debug token from LocalStorage:", e);
      }
    })
    .catch((err) => {
      console.warn("App Check initialization error or network issue:", err);
    });
}




