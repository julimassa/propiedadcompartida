import React, { useRef, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { resetPassword } from "../services/authService";
import { getAuthErrorMessage, validateAuthInput, PASSWORD_RESET_MESSAGE } from "../services/authMessages";

export default function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const pending = useRef(false);

  async function handleReset() {
    if (pending.current || sent) return;
    const validation = validateAuthInput(email);
    if (validation) return Alert.alert("Revisá tu correo", validation);
    pending.current = true;
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      Alert.alert("No se pudo solicitar la recuperación", getAuthErrorMessage(error, "reset"));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22 }}>Recuperar contraseña</Text>
      <Text>Ingresá el correo electrónico que usaste para registrarte.</Text>
      <TextInput placeholder="Email" accessibilityLabel="Correo electrónico"
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
        value={email} editable={!submitting}
        onChangeText={(value) => { setEmail(value); setSent(false); }}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />
      {sent && <Text accessibilityLiveRegion="polite">{PASSWORD_RESET_MESSAGE}</Text>}
      <Button title={submitting ? "Enviando…" : sent ? "Solicitud enviada" : "Enviar instrucciones"}
        disabled={submitting || sent} onPress={handleReset} />
      <Button title="Volver a Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}
