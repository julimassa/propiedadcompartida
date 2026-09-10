import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getExpensesByProperty } from "../services/expenseService";
import { formatDateLongES } from "../components/DateField";


export default function ExpensesListScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpensesByProperty(propertyId);
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const total = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [expenses]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Gastos</Text>

      <View style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}>
        <Text style={{ fontWeight: "800" }}>Total:</Text>
        <Text style={{ fontSize: 18 }}>${total.toFixed(2)}</Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("ExpenseCreate", { propertyId })}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>CARGAR GASTO</Text>
      </Pressable>

      {expenses.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>Todavía no hay gastos cargados.</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: "800" }}>
                ${Number(item.amount || 0).toFixed(2)} — {item.category}
              </Text>
              {item.description ? <Text>{item.description}</Text> : null}
              <Text style={{ opacity: 0.7, fontSize: 12, textTransform: "capitalize" }}>
                Fecha: {item.spentAt ? formatDateLongES(item.spentAt) : "—"}
              </Text>

            </View>
          )}
        />
      )}
    </View>
  );
}
