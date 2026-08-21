// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, CustomProvider } from "firebase/app-check";

import constants from "../../constants.json";

const firebaseConfig = {

};

export const APP_CHECK_DEMO_TOKEN = constants.APP_CHECK_DEMO_TOKEN;


// Enable App Check debug token in local web environment
if (typeof window !== 'undefined') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = APP_CHECK_DEMO_TOKEN;
}

// Initialize Firebase and Auth services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Initialize App Check
export const appCheck = initializeAppCheck(app, {
    provider: new CustomProvider({
        getToken: () => Promise.resolve({
            token: APP_CHECK_DEMO_TOKEN,
            expireTimeMillis: Date.now() + 3600000
        })
    }),
    isTokenAutoRefreshEnabled: true
});