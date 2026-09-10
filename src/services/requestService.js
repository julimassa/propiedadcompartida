import { ref, push, set, get, update  } from "firebase/database";
import { auth, db } from "./firebase";



export async function createRequest({ propertyId, fromDate, toDate }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario logueado.");
  if (!propertyId) throw new Error("Falta propertyId.");
  if (!fromDate || !toDate) throw new Error("Faltan fechas.");

  const reqRef = ref(db, `requests/${propertyId}`);
  const newReqRef = push(reqRef);

  const requestToSave = {
    id: newReqRef.key,
    propertyId,
    userId: user.uid,
    status: "PENDING",
    fromDate, // "YYYY-MM-DD"
    toDate,   // "YYYY-MM-DD"
    createdAt: Date.now(),
  };

  await set(newReqRef, requestToSave);
  return requestToSave;
}

export async function getRequestsByProperty(propertyId) {
  if (!propertyId) throw new Error("Falta propertyId.");

  const snap = await get(ref(db, `requests/${propertyId}`));
  if (!snap.exists()) return [];

  const obj = snap.val();
  const arr = Object.values(obj);

  // más nuevas primero
  return arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}
export async function updateRequestStatus({ propertyId, requestId, status }) {
  if (!propertyId) throw new Error("Falta propertyId.");
  if (!requestId) throw new Error("Falta requestId.");
  if (!status) throw new Error("Falta status.");

  await update(ref(db, `requests/${propertyId}/${requestId}`), {
    status,
    updatedAt: Date.now(),
  });
}
function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  // Fechas en formato "YYYY-MM-DD" se comparan bien como strings
  return aFrom <= bTo && bFrom <= aTo;
}
export async function approveRequestAndRejectOverlaps({ propertyId, requestId }) {
  if (!propertyId) throw new Error("Falta propertyId.");
  if (!requestId) throw new Error("Falta requestId.");

  // 1) Traer todas las solicitudes de la propiedad
  const snap = await get(ref(db, `requests/${propertyId}`));
  if (!snap.exists()) throw new Error("No hay solicitudes para esta propiedad.");

  const requestsObj = snap.val();
  const requests = Object.values(requestsObj);

  // 2) Encontrar la solicitud ganadora
  const winner = requests.find((r) => r.id === requestId);
  if (!winner) throw new Error("No se encontró la solicitud.");

  // 3) Marcar ganadora como APPROVED
  await update(ref(db, `requests/${propertyId}/${requestId}`), {
    status: "APPROVED",
    updatedAt: Date.now(),
  });

  // 4) Rechazar las que se superponen y estén pendientes (o incluso aprobadas)
  const updates = {};

  for (const r of requests) {
    if (r.id === winner.id) continue;

    // Solo rechazamos PENDING (recomendado)
    if (r.status !== "PENDING") continue;

    const overlap = rangesOverlap(winner.fromDate, winner.toDate, r.fromDate, r.toDate);

    if (overlap) {
      updates[`requests/${propertyId}/${r.id}/status`] = "REJECTED";
      updates[`requests/${propertyId}/${r.id}/updatedAt`] = Date.now();
    }
  }

  // 5) Aplicar updates en batch (más eficiente)
  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
}

