import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { login } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert("Error al iniciar sesión", e.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22 }}>Login</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Button title="Ingresar" onPress={handleLogin} />
      <Button title="Crear cuenta" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}

