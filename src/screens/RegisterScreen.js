import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { register } from "../services/authService";
import { createUserProfile } from "../services/userService";
import { getAuthErrorMessage, validateAuthInput } from "../services/authMessages";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);

  async function handleRegister() {
    if (pending.current) return;
    const validation = validateAuthInput(email, password, "register");
    if (validation) return Alert.alert("Revisá tus datos", validation);
    pending.current = true;
    setSubmitting(true);
    try {
      const user = await register(email, password);
      try {
        await createUserProfile({ uid: user.uid, email: user.email });
      } catch {
        Alert.alert("Cuenta creada", "Tu cuenta se creó y la sesión está iniciada, pero no pudimos guardar tu perfil. Contactá al administrador si el problema continúa. No necesitás registrarte otra vez.");
      }
      // AppNavigator responde al estado de Firebase, sin navegación manual.
    } catch (error) {
      Alert.alert("Error al registrarse", getAuthErrorMessage(error, "register"));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Registro</Text>
      <TextInput placeholder="Email" accessibilityLabel="Correo electrónico"
        value={email} onChangeText={setEmail} editable={!submitting}
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }} />
      <TextInput placeholder="Contraseña (mín 6)" accessibilityLabel="Contraseña, mínimo 6 caracteres"
        value={password} onChangeText={setPassword} secureTextEntry editable={!submitting}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }} />
      <Pressable accessibilityRole="button" disabled={submitting} onPress={handleRegister}
        style={{ padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1, opacity: submitting ? 0.5 : 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{submitting ? "CREANDO CUENTA…" : "CREAR CUENTA"}</Text>
      </Pressable>
      <Pressable accessibilityRole="link" disabled={submitting} onPress={() => navigation.navigate("Login")}
        style={{ padding: 14, alignItems: "center" }}>
        <Text>Volver a Login</Text>
      </Pressable>
    </View>
  );
}
