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
  const [categoryClickCount, setCategoryClickCount] = useState({});

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        // Initialize categories if user does not exist
        const initialCategories = categories.reduce((acc, category) => {
          acc[category] = 0; // Initialize each category count to 0
          return acc;
        }, {});

        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          categoryClickCount: initialCategories,
        });
        setCategoryClickCount(initialCategories);
      } else {
        const userData = docSnap.data();
        setCategoryClickCount(userData.categoryClickCount);
      }
      console.log(user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCategoryClickCount({}); // Clear category counts on logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Fetch categoryClickCount if the user is logged in
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCategoryClickCount(userData.categoryClickCount);
        }
      }
    });

    return unsubscribe;
  }, []);

  async function fetchCategoryClickCount() {
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
