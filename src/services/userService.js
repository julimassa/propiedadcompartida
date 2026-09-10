import { ref, set, get } from "firebase/database";
import { db } from "./firebase";

export async function createUserProfile({ uid, email }) {
  const userRef = ref(db, `users/${uid}`);

  // si ya existe, no lo pisamos
  const snap = await get(userRef);
  if (snap.exists()) return snap.val();

  const profile = {
    uid,
    email,
    createdAt: Date.now(),
    displayName: "",
  };

  await set(userRef, profile);
  return profile;
}
