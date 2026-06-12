import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(email, password, displayName, role) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    role,
    displayName,
    photoURL: null,
    createdAt: serverTimestamp(),
    profileComplete: false,
  });
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle(role) {
  const cred = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, "users", cred.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: cred.user.email,
      role: role || "teacher",
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
      createdAt: serverTimestamp(),
      profileComplete: false,
    });
  }
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
}
