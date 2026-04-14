const admin = require('firebase-admin');

// OPTIONAL: Firebase Admin SDK for phone-based authentication.
// To enable, download your service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in the backend root directory.

let firebaseInitialized = false;

try {
  const serviceAccount = require('../serviceAccountKey.json'); 
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  firebaseInitialized = true;
  console.log('Firebase Admin initialized successfully.');
} catch (err) {
  console.warn(
    '[WARNING] serviceAccountKey.json not found. Firebase phone auth is disabled.\n' +
    '          To enable it, download the key from Firebase Console and place it in the backend root.\n'
  );
}

module.exports = { admin, firebaseInitialized };
