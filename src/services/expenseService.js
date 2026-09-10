import { ref, push, set, get, update } from "firebase/database";
import { auth, db } from "./firebase";

export async function createExpense({ propertyId, expenseData }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");

  const expensesRef = ref(db, `expenses/${propertyId}`);
  const newRef = push(expensesRef);
  const expenseId = newRef.key;

  const toSave = {
    id: expenseId,
    propertyId,
    createdAt: Date.now(),
    createdBy: user.uid,
    ...expenseData,
  };

  await set(newRef, toSave);
  return toSave;
}

export async function getExpensesByProperty(propertyId) {
  if (!propertyId) return [];

  const snap = await get(ref(db, `expenses/${propertyId}`));
  if (!snap.exists()) return [];

  const data = Object.values(snap.val());

  // orden: más recientes primero (por createdAt)
  data.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return data;
}

export async function updateExpense({ propertyId, expenseId, patch }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");
  if (!expenseId) throw new Error("Falta expenseId.");

  await update(ref(db, `expenses/${propertyId}/${expenseId}`), {
    ...patch,
    updatedAt: Date.now(),
    updatedBy: user.uid,
  });
}
