import React, { useContext, useState, useEffect } from "react";
import { getAuthInstance } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import config from "../config";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Helper function to ensure user exists in Firestore
async function ensureUserInFirestore(user) {
  if (!user) return;

  try {
    const token = await user.getIdToken();
    const response = await fetch(`${config.apiUrl}/api/users/ensure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("User ensured in Firestore:", data);
    } else {
      console.warn("Failed to ensure user in Firestore");
    }
  } catch (error) {
    console.error("Error ensuring user in Firestore:", error);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuthInstance();

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Ensure user is created in Firestore
    await ensureUserInFirestore(result.user);
    return result;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Ensure user exists in Firestore when auth state changes
      if (user) {
        await ensureUserInFirestore(user);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
