import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RequestsListScreen from "../screens/RequestsListScreen";
import RequestCreateScreen from "../screens/RequestCreateScreen";
import PropertySelectScreen from "../screens/PropertySelectScreen";
import PropertyHomeScreen from "../screens/PropertyHomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ExpensesListScreen from "../screens/ExpensesListScreen";
import ExpenseCreateScreen from "../screens/ExpenseCreateScreen";
import ServicesScreen from "../screens/ServicesScreen";



const Stack = createStackNavigator();

export default function PropertyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PropertySelect" component={PropertySelectScreen} options={{ title: "Mis propiedades" }} />
      <Stack.Screen name="PropertyHome" component={PropertyHomeScreen} options={{ title: "Propiedad" }} />
      <Stack.Screen name="RequestsList" component={RequestsListScreen} options={{ title: "Solicitudes" }} />
      <Stack.Screen name="RequestCreate" component={RequestCreateScreen} options={{ title: "Solicitar fechas" }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: "Calendario" }} />
      <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ title: "Gastos" }} />
      <Stack.Screen name="ExpenseCreate" component={ExpenseCreateScreen} options={{ title: "Cargar gasto" }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ title: "Servicios" }} />



    </Stack.Navigator>
  );
}
