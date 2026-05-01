import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "../firebase.js";

export function userProfileRef(uid) {
  return doc(db, "users", uid);
}

export async function createUserProfile(user, { fullName = "", generalLocation = "" } = {}) {
  const profile = {
    uid: user.uid,
    fullName: fullName.trim(),
    email: user.email,
    profilePhotos: [],
    generalLocation: generalLocation.trim(),
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
  await updateDoc(userProfileRef(uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadProfilePhotos(uid, files) {
  const uploadedUrls = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const photoRef = ref(storage, `users/${uid}/profilePhotos/${Date.now()}-${safeName}`);

    await uploadBytes(photoRef, file, { contentType: file.type });
    uploadedUrls.push(await getDownloadURL(photoRef));
  }

  if (uploadedUrls.length > 0) {
    await updateDoc(userProfileRef(uid), {
      profilePhotos: arrayUnion(...uploadedUrls),
      updatedAt: serverTimestamp(),
    });
  }

  return uploadedUrls;
}
