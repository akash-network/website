import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-pgqwmld1sYERnucmesvmXPQlle6zlv0",
  authDomain: "akash-e0b94.firebaseapp.com",
  projectId: "akash-e0b94",
  storageBucket: "akash-e0b94.firebasestorage.app",
  messagingSenderId: "103803681527",
  appId: "1:103803681527:web:98fc16f6777b7f7e8571f2",
  measurementId: "G-MFNNYS3W1Q",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
