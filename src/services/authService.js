import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { getAuthErrorMessage, validateAuthInput } from "./authMessages";

export async function register(email, password) {
  const validation = validateAuthInput(email, password, "register");
  if (validation) throw new Error(validation);
  const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return res.user;
}

export async function login(email, password) {
  const validation = validateAuthInput(email, password, "login");
  if (validation) throw new Error(validation);
  const res = await signInWithEmailAndPassword(auth, email.trim(), password);
  return res.user;
}

export async function resetPassword(email) {
  const validation = validateAuthInput(email);
  if (validation) throw new Error(validation);
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    // Mismo resultado público aunque Firebase revele que la cuenta no existe.
    if (error.code !== "auth/user-not-found") throw error;
  }
}

let logoutRequest = null;
export function logout() {
  if (!logoutRequest) {
    logoutRequest = signOut(auth)
      .catch((error) => { throw new Error(getAuthErrorMessage(error, "logout")); })
      .finally(() => { logoutRequest = null; });
  }
  return logoutRequest;
}
