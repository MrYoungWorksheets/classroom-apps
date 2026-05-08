// Firebase web config is not a password.
// Real security must come from Firebase Authentication and Firestore Security Rules.
// Do not put service account keys in frontend files.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_WEB_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
