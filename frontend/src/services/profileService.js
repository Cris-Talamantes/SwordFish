import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase.js";

export function userProfileRef(uid) {
  return doc(db, "users", uid);
}

export async function createUserProfile(user, { fullName = "", generalLocation = "" } = {}) {
  const firstName = fullName.trim().split(" ")[0] ?? "";
  const profile = {
    uid: user.uid,
    firstName,
    fullName: fullName.trim(),
    email: user.email,
    age: "",
    generalLocation: generalLocation.trim(),
    relationshipRole: "",
    storyContext: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userProfileRef(user.uid), profile, { merge: true });
  return profile;
}

export async function ensureUserProfile(user) {
  const snapshot = await getDoc(userProfileRef(user.uid));

  if (!snapshot.exists()) {
    return createUserProfile(user);
  }

  return snapshot.data();
}

export async function updateUserProfile(uid, updates) {
  await setDoc(
    userProfileRef(uid),
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
