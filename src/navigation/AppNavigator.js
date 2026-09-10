import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import AuthNavigator from "./AuthNavigator";
import PropertyNavigator from "./PropertyNavigator";
import { auth } from "../services/firebase";

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) return null; // después ponemos un loader

  return user ? <PropertyNavigator /> : <AuthNavigator />;
}
