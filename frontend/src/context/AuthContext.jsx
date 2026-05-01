import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { onSnapshot } from "firebase/firestore";

import { auth } from "../firebase.js";
import { createUserProfile, ensureUserProfile, userProfileRef } from "../services/profileService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile();
      setCurrentUser(user);
      setProfile(null);
      setProfileLoading(Boolean(user));

      if (!user) {
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      try {
        await ensureUserProfile(user);
      } catch (error) {
        console.error("Unable to ensure user profile", error);
      }

      unsubscribeProfile = onSnapshot(
        userProfileRef(user.uid),
        (snapshot) => {
          setProfile(snapshot.exists() ? snapshot.data() : null);
          setProfileLoading(false);
        },
        (error) => {
          console.error("Unable to load user profile", error);
          setProfile(null);
          setProfileLoading(false);
        }
      );

      setLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  async function signup(email, password, fullName, generalLocation) {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    if (fullName) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }

    await createUserProfile(credential.user, { fullName, generalLocation });
    return credential;
  }

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      profile,
      profileLoading,
      login: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
      signup,
      logout: () => signOut(auth),
    }),
    [currentUser, loading, profile, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
