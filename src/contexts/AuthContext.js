// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import categories from '../lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryClickCount,setCategoryClickCount] = useState({})

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      console.log(user)
      if (!docSnap.exists()) {
        // If user doesn't exist, create a new document for them

        const initialCategories = categories.reduce((acc, category) => {
          acc[category] = 0; // Initialize each category count to 0
          return acc;
        }, {});

        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          categoryClickCount : initialCategories
        });
        setCategoryClickCount(initialCategories)
      }
      else{
        const userData = docSnap.data();
        setCategoryClickCount(userData.categoryClickCount);
      }

    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function fetchCategoryClickCount(){
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);
      setCategoryClickCount(docSnap.data().categoryClickCount)
  }

  const value = {
    currentUser,
    googleSignIn,
    logout,
    fetchCategoryClickCount,
    categoryClickCount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}