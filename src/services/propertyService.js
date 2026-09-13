import { ref, push, set, get, update, remove } from "firebase/database";
import { auth, db } from "./firebase";
import { ROLES, normalizePropertyRole } from "../constants/roles";

// =========================
// PROPIEDADES
// =========================

export async function createProperty(propertyData) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");

  const propertiesRef = ref(db, "properties");
  const newPropRef = push(propertiesRef);
  const propertyId = newPropRef.key;

  const propertyToSave = {
    id: propertyId,
    createdAt: Date.now(),
    createdBy: user.uid,
    ...propertyData,
  };

  await set(newPropRef, propertyToSave);

  await set(ref(db, `memberships/${propertyId}/${user.uid}`), {
    role: ROLES.ADMIN,
    since: Date.now(),
  });

  await set(ref(db, `userProperties/${user.uid}/${propertyId}`), true);

  return propertyToSave;
}

export async function getMyProperties() {
  const user = auth.currentUser;
  if (!user) return [];

  const userPropsRef = ref(db, `userProperties/${user.uid}`);
  const userPropsSnap = await get(userPropsRef);

  if (!userPropsSnap.exists()) return [];

  const propertyIds = Object.keys(userPropsSnap.val());
  const properties = [];

  for (const propertyId of propertyIds) {
    const propRef = ref(db, `properties/${propertyId}`);
    const propSnap = await get(propRef);

    if (propSnap.exists()) {
      properties.push(propSnap.val());
    }
  }

  return properties;
}

export async function getPropertyById(propertyId) {
  const propRef = ref(db, `properties/${propertyId}`);
  const snap = await get(propRef);
  if (!snap.exists()) return null;
  return snap.val();
}

export async function updateProperty(propertyId, propertyData) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");

  await update(ref(db, `properties/${propertyId}`), {
    ...propertyData,
    updatedAt: Date.now(),
    updatedBy: user.uid,
  });
}

export async function removeMyProperty(propertyId) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");

  await remove(ref(db, `userProperties/${user.uid}/${propertyId}`));
  await remove(ref(db, `memberships/${propertyId}/${user.uid}`));
}

// =========================
// ROLES
// =========================

export async function getMyRoleInProperty(propertyId) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");

  const snap = await get(ref(db, `memberships/${propertyId}/${user.uid}`));
  if (!snap.exists()) return null;
  return normalizePropertyRole(snap.val()?.role);
}

// =========================
// SERVICIOS
// =========================

export async function getPropertyServices(propertyId) {
  if (!propertyId) throw new Error("Falta propertyId.");

  const snap = await get(ref(db, `properties/${propertyId}/services`));
  return snap.exists() ? snap.val() : {};
}

export async function updatePropertyServices(propertyId, servicesPatch) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");

  await update(ref(db, `properties/${propertyId}`), {
    services: servicesPatch,
    servicesUpdatedAt: Date.now(),
    servicesUpdatedBy: user.uid,
  });
}

// =========================
// COMENTARIOS DE SERVICIOS
// (participants escriben, admins leen)
// =========================

export async function createServiceComment(propertyId, message) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");
  if (!message || !message.trim()) throw new Error("Falta comentario.");

  const commentsRef = ref(db, `serviceComments/${propertyId}`);
  const newRef = push(commentsRef);

  const payload = {
    id: newRef.key,
    message: message.trim(),
    createdAt: Date.now(),
    createdBy: user.uid,
    authorEmail: user.email ?? "",
  };

  await set(newRef, payload);
  return payload;
}

export async function getServiceComments(propertyId) {
  if (!propertyId) throw new Error("Falta propertyId.");

  const snap = await get(ref(db, `serviceComments/${propertyId}`));
  if (!snap.exists()) return [];

  const obj = snap.val(); // {id: {...}, id2:{...}}
  const arr = Object.values(obj);

  // más nuevos primero
  arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return arr;
}

