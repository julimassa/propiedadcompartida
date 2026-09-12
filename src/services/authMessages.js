export const PASSWORD_RESET_MESSAGE = "Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer tu contraseña. Revisá también la carpeta de spam.";

export function validateAuthInput(email, password, mode = "reset") {
  if (!email.trim() || (mode !== "reset" && !password)) {
    return mode === "reset" ? "Ingresá tu correo electrónico." : "Completá el correo electrónico y la contraseña.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Ingresá un correo electrónico válido, por ejemplo nombre@correo.com.";
  }
  if (mode === "register" && password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return null;
}

export function getAuthErrorMessage(error, mode = "login") {
  const messages = {
    "auth/email-already-in-use": "Ya existe una cuenta registrada con este correo electrónico. Iniciá sesión o recuperá tu contraseña.",
    "auth/invalid-email": "Ingresá un correo electrónico válido, por ejemplo nombre@correo.com.",
    "auth/missing-email": "Ingresá tu correo electrónico.",
    "auth/missing-password": "Ingresá tu contraseña.",
    "auth/invalid-credential": "El correo electrónico o la contraseña son incorrectos. Revisalos o recuperá tu contraseña.",
    "auth/invalid-login-credentials": "El correo electrónico o la contraseña son incorrectos. Revisalos o recuperá tu contraseña.",
    "auth/user-not-found": "El correo electrónico o la contraseña son incorrectos. Revisalos o recuperá tu contraseña.",
    "auth/wrong-password": "El correo electrónico o la contraseña son incorrectos. Revisalos o recuperá tu contraseña.",
    "auth/weak-password": "La contraseña es demasiado débil. Usá al menos 6 caracteres y combiná letras, números y símbolos.",
    "auth/password-does-not-meet-requirements": "La contraseña no cumple los requisitos de seguridad. Probá una más larga que combine mayúsculas, minúsculas, números y símbolos.",
    "auth/user-disabled": "Esta cuenta está deshabilitada. Contactá al administrador para obtener ayuda.",
    "auth/too-many-requests": "Hubo demasiados intentos. Esperá unos minutos antes de volver a intentarlo.",
    "auth/network-request-failed": "No pudimos conectarnos. Revisá tu conexión a internet y volvé a intentarlo.",
    "auth/operation-not-allowed": "Esta opción no está disponible en este momento. Contactá al administrador.",
    "auth/requires-recent-login": "Para continuar, volvé a iniciar sesión.",
  };
  const fallback = {
    login: "No pudimos iniciar sesión. Volvé a intentarlo en unos minutos.",
    register: "No pudimos crear tu cuenta. Volvé a intentarlo en unos minutos.",
    reset: "No pudimos solicitar la recuperación. Volvé a intentarlo en unos minutos.",
    logout: "No pudimos cerrar sesión. Volvé a intentarlo.",
  };
  return messages[error?.code] || fallback[mode] || fallback.login;
}
