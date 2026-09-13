export const ROLES = Object.freeze({
  ADMIN: "admin",
  PARTICIPANT: "participant",
});

export function normalizePropertyRole(role) {
  return role === ROLES.ADMIN || role === ROLES.PARTICIPANT ? role : null;
}
