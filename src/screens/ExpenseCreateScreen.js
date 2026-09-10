import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createExpense } from "../services/expenseService";
import DateField from "../components/DateField";


export default function ExpenseCreateScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [spentAt, setSpentAt] = useState(""); // YYYY-MM-DD

  async function handleSave() {
    try {
      if (!amount.trim() || isNaN(Number(amount))) {
        Alert.alert("Monto inválido", "Ingresá un monto numérico.");
        return;
      }
      if (!category.trim()) {
        Alert.alert("Falta categoría", "Ingresá una categoría (ej: Super, Arreglo, Limpieza).");
        return;
      }

      await createExpense({
        propertyId,
        expenseData: {
          amount: Number(amount),
          category: category.trim(),
          description: description.trim(),
          spentAt: spentAt.trim(), // opcional
        },
      });

      Alert.alert("Listo ✅", "Gasto guardado.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Cargar gasto</Text>

          <TextInput
            placeholder="Monto (ej: 15000)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={inputStyle}
          />

          <TextInput
            placeholder="Categoría (ej: Super, Limpieza, Arreglo)"
            value={category}
            onChangeText={setCategory}
            style={inputStyle}
          />

          <TextInput
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            style={inputStyle}
          />

          <DateField
            label="Fecha del gasto"
            valueISO={spentAt}
            onChangeISO={setSpentAt}
          />


          <Pressable
            onPress={handleSave}
            style={{ padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "800" }}>GUARDAR</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderRadius: 10,
  padding: 12,
};
