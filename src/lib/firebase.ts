import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA_FVb9T9PlPB-4foVWIxUlvAy_gSwkj0A",
  authDomain: "anti-macro-ticket.firebaseapp.com",
  projectId: "anti-macro-ticket",
  storageBucket: "anti-macro-ticket.firebasestorage.app",
  messagingSenderId: "1087198428972",
  appId: "1:1087198428972:web:850918f65e402487777689"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export const db = getFirestore(app);