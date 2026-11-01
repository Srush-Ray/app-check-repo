# Firebase App Check Workshop Demo

A full-stack monorepo demonstrating **Firebase Authentication**, **Cloud Firestore**, and **Firebase App Check** across a **Node.js/Express Backend**, a **React + Vite Web App**, and an **Expo / React Native Mobile App**.

---

## 📁 Repository Structure

```text
app-check-repo/
├── constants.json              # Shared configuration (App Check debug token, Backend port & URL)
├── script.txt                  # Quick commands to install dependencies across all apps
├── backend/                    # Node.js + Express server with Firebase Admin SDK & App Check middleware
│   ├── server.js               # Express API routes (/add, /addData, /details, /read, /health)
│   ├── serviceAccountKey.json  # Firebase Admin SDK service account credentials
│   ├── add_test_data.js        # Script to test sending 10 POST requests to /add
│   └── test.txt                # Sample cURL commands to test App Check token verification
├── web/                        # React 19 + Vite frontend application
│   └── src/
│       ├── firebase.js         # Firebase client SDK + App Check initialization
│       └── pages/              # Login, Home (submit details), and Details (view entries) pages
└── mobile/                     # React Native (Expo) mobile application
    ├── App.js                  # Root navigation and auth state listener
    └── src/
        ├── firebase.js         # Firebase client SDK + App Check setup for native/web
        └── pages/              # LoginScreen and HomeScreen
```

---

## 🔑 1. Where to Get Firebase Credentials & Where to Add Them

Before running the apps, you need two sets of credentials from the [Firebase Console](https://console.firebase.google.com/):

### A. Frontend Firebase Config (`web` & `mobile`)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Click the **Gear icon (⚙️)** in the top-left sidebar and select **Project settings**.
3. Scroll down to the **Your apps** section under the **General** tab:
   - If you haven't registered a Web app yet, click the **`</>` (Web)** icon to register one.
   - Select **Config** under *SDK setup and configuration* to copy your `firebaseConfig` object (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
4. **Where to add it:**
   - **Web App:** Open [`web/src/firebase.js`](./web/src/firebase.js) and replace the `firebaseConfig` object (lines 9–16) with your project's configuration:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```
   - **Mobile App:** Open [`mobile/src/firebase.js`](./mobile/src/firebase.js) and ensure `firebaseConfig` points to your Firebase web/client config object.

---

### B. Backend Service Account Key (`backend`)

1. In the [Firebase Console](https://console.firebase.google.com/), go to **Project settings (⚙️)** → **Service accounts** tab.
2. Select **Node.js** and click **Generate new private key**.
3. Confirm to download the JSON key file.
4. **Where to add it:**
   - Rename the downloaded file to `serviceAccountKey.json` and place it inside the [`backend/`](./backend/) folder:
     ```text
     backend/serviceAccountKey.json
     ```
   - [`backend/server.js`](./backend/server.js) automatically loads `./serviceAccountKey.json` on startup to initialize `firebase-admin` and connect to Firestore.

---

## 🛡️ 2. Where to Get the Firebase App Check Debug Token & Where to Add It

Firebase App Check protects your backend and Firebase resources (like Firestore) from unauthorized clients. During local development, a **Debug Token** is used instead of a production attestation provider.

### How to Get / Register a Debug Token

#### Option A: Generate a Token in the Firebase Console (Recommended)
1. Open the [Firebase Console](https://console.firebase.google.com/) and navigate to **Build** → **App Check** in the left sidebar.
2. Click the **Apps** tab, locate your Web/Mobile app, and click the **three-dot menu (`⋮`)** → **Manage debug tokens**.
3. Click **Add debug token**, give it a name (e.g., `Local Dev Token`), and click **Generate token** (or paste a UUIDv4 token).
4. Copy the generated UUID token (e.g., `65E49888-F06C-46E1-8F1C-6C6F93796503`) and click **Save**.

#### Option B: Get the Auto-Generated Debug Token from the Browser Console
1. If `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` is set in development (or when running [`mobile/src/firebase.js`](./mobile/src/firebase.js) on web), open your browser's **Developer Tools Console (`F12` / `Cmd+Option+I`)**.
2. Look for the console message:
   ```text
   App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX. You will need to add it to your app's App Check settings in the Firebase console for it to work.
   ```
   *(It is also stored in browser `localStorage` under a key containing `_fire_appcheck_dbt`.)*
3. Copy that token and register it in **Firebase Console** → **App Check** → **Apps** → **Manage debug tokens**.

---

### Where to Add the Debug Token in This Repo

All apps in this repository read the App Check token from the root [`constants.json`](./constants.json) file!

1. Open [`constants.json`](./constants.json) at the root of the repository:
   ```json
   {
     "APP_CHECK_DEMO_TOKEN": "YOUR-DEBUG-TOKEN-UUID-HERE",
     "PORT": 5001,
     "BACKEND_URL": "http://localhost:5001"
   }
   ```
2. Replace `"APP_CHECK_DEMO_TOKEN"` with your debug token.
3. **How it is used across the repo:**
   - **Frontend (`web/src/firebase.js`):** Imports `constants.APP_CHECK_DEMO_TOKEN`, sets `window.FIREBASE_APPCHECK_DEBUG_TOKEN`, and passes the token in the `X-Firebase-AppCheck` HTTP header on requests to the backend ([`web/src/pages/Home.jsx`](./web/src/pages/Home.jsx) & [`web/src/pages/Details.jsx`](./web/src/pages/Details.jsx)).
   - **Mobile (`mobile/src/firebase.js`):** Imports `constants.APP_CHECK_DEMO_TOKEN` and assigns it to `globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN` in `__DEV__` mode.
   - **Backend (`backend/server.js`):** Imports `constants.APP_CHECK_DEMO_TOKEN` in the `verifyAppCheck` middleware (lines 52–76) to verify incoming `X-Firebase-AppCheck` headers alongside `admin.appCheck().verifyToken()`.
     > **Note:** To enforce App Check verification on the backend, uncomment the body of `verifyAppCheck` in [`backend/server.js`](./backend/server.js) (lines 55–75) and remove `return next();` on line 53.

---

## 🚀 3. How to Run Each App

### Prerequisites
- **Node.js** (v18+ recommended) and **npm**
- **Expo Go** app on iOS/Android or an iOS Simulator / Android Emulator (for `mobile`)

### Quick Install All Dependencies
From the root directory, install dependencies for all three apps:

```bash
cd backend && npm install
cd ../web && npm install
cd ../mobile && npm install
cd ..
```

---

### 1️⃣ Backend App (`backend/`)

The Express backend connects to Firestore via the Firebase Admin SDK and exposes endpoints (`/add`, `/addData`, `/details`, `/read`, `/health`) on port `5001`.

```bash
cd backend
npm install

# Start the server
npm start
# Or run with nodemon for auto-reload:
npm run dev
```

- **Server URL:** `http://localhost:5001`
- **Health Check:** `http://localhost:5001/health`
- **Testing Scripts:**
  - Run `node add_test_data.js` inside `backend/` to send 10 sample `POST /add` requests without an App Check token.
  - See [`backend/test.txt`](./backend/test.txt) for ready-to-use `curl` commands testing missing, invalid, and valid `X-Firebase-AppCheck` headers.

---

### 2️⃣ Web App (`web/`)

The React + Vite frontend lets users sign in (Email/Password or Google), submit contact information to Firestore/Backend, and view stored records.

```bash
cd web
npm install

# Start the Vite development server
npm run dev
```

- **Local URL:** Typically `http://localhost:5173` (shown in your terminal)
- **Production Build:** `npm run build` followed by `npm run preview`

---

### 3️⃣ Mobile App (`mobile/`)

The Expo (React Native) app provides mobile login and contact form submission to the backend with the `X-Firebase-AppCheck` token header.

```bash
cd mobile
npm install

# Start the Expo development server
npm start
```

Or launch directly on a target platform:
```bash
npm run ios       # Launch in iOS Simulator (connects to http://localhost:5001)
npm run android   # Launch in Android Emulator (connects to http://10.0.2.2:5001)
npm run web       # Launch in Web Browser
```

