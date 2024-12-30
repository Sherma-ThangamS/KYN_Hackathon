// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAYnwBHk3KtIrCAlX34tR7iPOU9ininIH8",
  authDomain: "kynhack-81889.firebaseapp.com",
  projectId: "kynhack-81889",
  storageBucket: "kynhack-81889.firebasestorage.app",
  messagingSenderId: "92630191519",
  appId: "1:92630191519:web:a663a5f59927aa334901aa",
  measurementId: "G-W9CEY4NHPN"
};
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;