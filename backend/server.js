const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const constants = require('../constants.json');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let db;
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  serviceAccount = null;
}


try {
  if (serviceAccount && serviceAccount.private_key && serviceAccount.client_email) {
    // Full Service Account Certificate
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || serviceAccount.projectId
    });
    console.log("Firebase Admin SDK initialized successfully using Service Account Certificate.");
  } else {
    // Client config or environment credentials with explicit projectId
    const projectId = serviceAccount?.projectId || serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID || 'workshop-firebase-58404';
    admin.initializeApp({
      projectId: projectId
    });
    console.log(`Firebase Admin SDK initialized successfully with projectId: ${projectId}`);
  }
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK:", error.message);
}


// Get Firestore reference if initialized
if (admin.apps.length > 0) {
  db = admin.firestore();
}

// Middleware to verify Firebase App Check tokens
const verifyAppCheck = async (req, res, next) => {
  return next();
  //UNCOMMENT BELOW LINES TO RUN THE APP
  // const appCheckToken = req.header('X-Firebase-AppCheck');

  // if (!appCheckToken) {
  //   console.warn("[App Check] Rejecting request: Missing App Check token");
  //   return res.status(401).json({ error: 'Unauthorized: Missing App Check token.' });
  // }

  // // Validate demo / debug App Check token
  // if (appCheckToken === constants.APP_CHECK_DEMO_TOKEN) {
  //   console.log("[App Check] Verified demo/debug App Check token successfully.");
  //   return next();
  // }


  // try {
  //   await admin.appCheck().verifyToken(appCheckToken);
  //   return next();
  // } catch (err) {
  //   console.error("[App Check] Token verification failed:", err.message);
  //   return res.status(401).json({ error: 'Unauthorized: Invalid App Check token.' });
  // }
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

// POST /add route
app.post('/addData', verifyAppCheck, async (req, res) => {

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


// GET /details or GET /read - Read all data in 'details' collection
app.get(['/details', '/read'], verifyAppCheck, async (req, res) => {
  if (!db) {
    return res.status(503).json({
      error: 'Firestore database is not initialized. Please configure the serviceAccountKey.json file on the server.'
    });
  }

  try {
    const snapshot = await db.collection('details').get();
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No data found in details collection.',
        data: {}
      });
    }

    const allData = {};
    snapshot.forEach((doc) => {
      allData[doc.id] = doc.data();
    });

    return res.status(200).json({
      success: true,
      count: snapshot.size,
      data: allData
    });
  } catch (error) {
    console.error("[Error] Failed to read details collection:", error.message);
    return res.status(500).json({
      error: 'Failed to read data from database: ' + error.message
    });
  }
});

// GET /details/:uid or GET /read/:uid - Read data for a specific uid/uuid from 'details' collection
app.get(['/details/:uid', '/read/:uid'], verifyAppCheck, async (req, res) => {

  const { uid } = req.params;

  if (!uid || !uid.trim()) {
    return res.status(400).json({
      error: 'Please provide a valid uid parameter.'
    });
  }

  if (!db) {
    return res.status(503).json({
      error: 'Firestore database is not initialized. Please configure the serviceAccountKey.json file on the server.'
    });
  }

  try {
    const docRef = db.collection('details').doc(uid.trim());
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        error: `No details found for uid: ${uid.trim()}`
      });
    }

    return res.status(200).json({
      success: true,
      uid: uid.trim(),
      data: docSnap.data()
    });
  } catch (error) {
    console.error(`[Error] Failed to read details for user ${uid}:`, error.message);
    return res.status(500).json({
      error: 'Failed to read data from database: ' + error.message
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
