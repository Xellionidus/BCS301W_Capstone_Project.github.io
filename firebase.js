import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app = null;
let db = null;
let firebaseReady = false;

try {
  const configLooksFilled =
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  if (configLooksFilled) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseReady = true;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export {
  db,
  firebaseReady,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
};
