import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { register } from "../services/authService";
import { createUserProfile } from "../services/userService";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      if (!email.trim() || !password) {
        Alert.alert("Faltan datos", "Completá email y contraseña.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Contraseña débil", "Debe tener al menos 6 caracteres.");
        return;
      }

      const user = await register(email.trim(), password);
      await createUserProfile({ uid: user.uid, email: user.email });

      
      // No navegamos manualmente: AppNavigator detecta la sesión y cambia solo a Propiedades
    } catch (e) {
      Alert.alert("Error al registrarse", e.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Registro</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TextInput
        placeholder="Contraseña (mín 6)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        onPress={handleRegister}
        style={{ padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1 }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>CREAR CUENTA</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()} style={{ padding: 14, alignItems: "center" }}>
      <Text>Volver a Login</Text>
      </Pressable>

    </View>
  );
}
