import React, { useRef, useState } from "react";
import { View, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { login } from "../services/authService";
import { getAuthErrorMessage, validateAuthInput } from "../services/authMessages";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);

  async function handleLogin() {
    if (pending.current) return;
    const validation = validateAuthInput(email, password, "login");
    if (validation) return Alert.alert("Revisá tus datos", validation);
    pending.current = true;
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert("Error al iniciar sesión", getAuthErrorMessage(error, "login"));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22 }}>Login</Text>
      <TextInput
        placeholder="Email" accessibilityLabel="Correo electrónico"
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
        value={email} onChangeText={setEmail} editable={!submitting}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Contraseña" accessibilityLabel="Contraseña" secureTextEntry
        value={password} onChangeText={setPassword} editable={!submitting}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <Button title={submitting ? "Ingresando…" : "Ingresar"} disabled={submitting} onPress={handleLogin} />
      <Pressable accessibilityRole="link" disabled={submitting}
        onPress={() => navigation.navigate("ResetPassword", { email: email.trim() })}
        style={{ padding: 12, alignItems: "center", opacity: submitting ? 0.5 : 1 }}>
        <Text style={{ color: "#0066cc", textDecorationLine: "underline" }}>¿Olvidaste tu contraseña?</Text>
      </Pressable>
      <Button title="Crear cuenta" disabled={submitting} onPress={() => navigation.navigate("Register")} />
    </View>
  );
}
