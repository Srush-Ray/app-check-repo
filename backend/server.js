const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let db;
try {
  // Check if serviceAccountKey.json exists, otherwise fall back to environment credentials
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully using serviceAccountKey.json.");
} catch (error) {
  console.warn("---------------------------------------------------------------------------------");
  console.warn("WARNING: serviceAccountKey.json not found or failed to load.");
  console.warn("To connect to your Firestore database, please generate a private key from the");
  console.warn("Firebase Console (Project Settings -> Service Accounts -> Generate New Private Key)");
  console.warn("and save it as 'backend/serviceAccountKey.json'.");
  console.warn("Attempting to initialize Firebase Admin SDK using application default credentials...");
  console.warn("---------------------------------------------------------------------------------");
  
  try {
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized using default credentials.");
  } catch (initError) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK:", initError.message);
  }
}

// Get Firestore reference if initialized
if (admin.apps.length > 0) {
  db = admin.firestore();
}

// Middleware to verify Firebase App Check tokens
const verifyAppCheck = async (req, res, next) => {
  const appCheckToken = req.header('X-Firebase-AppCheck');

  if (!appCheckToken) {
    console.warn("[App Check] Rejecting request: Missing App Check token");
    return res.status(401).json({ error: 'Unauthorized: Missing App Check token.' });
  }

  try {
    await admin.appCheck().verifyToken(appCheckToken);
    return next();
  } catch (err) {
    console.error("[App Check] Token verification failed:", err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid App Check token.' });
  }
};

// POST /add route
app.post('/add', verifyAppCheck, async (req, res) => {

  const { uid, username, email, phonenumber } = req.body;

  // 1. Check for missing values
  if (!uid || !username || !email || !phonenumber) {
    return res.status(400).json({ 
      error: 'Missing required fields. Please provide: uid, username, email, phonenumber' 
    });
  }

  // 2. Check for empty values
  if (!uid.trim() || !username.trim() || !email.trim() || !phonenumber.trim()) {
    return res.status(400).json({ 
      error: 'All fields (uid, username, email, phonenumber) must contain valid non-empty values.' 
    });
  }

  // 3. Verify database initialization
  if (!db) {
    return res.status(503).json({ 
      error: 'Firestore database is not initialized. Please configure the serviceAccountKey.json file on the server.' 
    });
  }

  try {
    const timestamp = Date.now().toString();
    const userDocRef = db.collection('details').doc(uid.trim());

    // Update the document by nesting the contact details under the timestamp key
    await userDocRef.set({
      [timestamp]: {
        username: username.trim(),
        email: email.trim(),
        phonenumber: phonenumber.trim()
      }
    }, { merge: true });

    console.log(`[Success] Added entry for user ${uid} under timestamp ${timestamp}`);

    return res.status(200).json({
      success: true,
      message: 'Details successfully stored in Firestore',
      timestamp: timestamp,
      data: {
        username: username.trim(),
        email: email.trim(),
        phonenumber: phonenumber.trim()
      }
    });
  } catch (error) {
    console.error(`[Error] Failed to write to Firestore for user ${uid}:`, error.message);
    return res.status(500).json({ 
      error: 'Failed to write data to database: ' + error.message 
    });
  }
});

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', firebaseInitialized: admin.apps.length > 0 });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node.js server is running on port ${PORT}`);
});
