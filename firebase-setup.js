import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDA7WjMm9nEtVgvW5JiE4tA9E_7fUPrhk0",
  authDomain: "livliv-tool.firebaseapp.com",
  projectId: "livliv-tool",
  storageBucket: "livliv-tool.firebasestorage.app",
  messagingSenderId: "739237308023",
  appId: "1:739237308023:web:3cb10be528064239610872"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.livlivFirebase = {
  app,
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  onSnapshot,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signOut
};

window.dispatchEvent(new CustomEvent("livliv:firebase-ready", {
  detail: window.livlivFirebase
}));
