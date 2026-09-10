import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getRequestsByProperty,
  updateRequestStatus,
  approveRequestAndRejectOverlaps,
} from "../services/requestService";
import { formatDateLongES } from "../components/DateField";


export default function RequestsListScreen({ navigation, route }) {
  const propertyId = route?.params?.propertyId;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRequestsByProperty(propertyId);
      setRequests(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Solicitudes
      </Text>

      <Pressable
        onPress={() => navigation.navigate("RequestCreate", { propertyId })}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "800" }}>NUEVA SOLICITUD</Text>
      </Pressable>

      {requests.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>Todavía no hay solicitudes.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const estadoLabel =
              item.status === "PENDING"
                ? "Pendiente"
                : item.status === "APPROVED"
                ? "Aprobada"
                : item.status === "REJECTED"
                ? "Rechazada"
                : item.status;

            return (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  gap: 6,
                }}
              >
                <Text style={{ fontWeight: "800" }}>{estadoLabel}</Text>

                <Text style={{ fontSize: 16, textTransform: "capitalize" }}>
                    {formatDateLongES(item.fromDate)} → {formatDateLongES(item.toDate)}
                </Text>


                <Text style={{ opacity: 0.7, fontSize: 12 }}>
                  Creada: {new Date(item.createdAt).toLocaleString()}
                </Text>

                {item.status === "PENDING" ? (
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                    <Pressable
                      onPress={async () => {
                        try {
                          await approveRequestAndRejectOverlaps({
                            propertyId,
                            requestId: item.id,
                          });
                          await load();
                        } catch (e) {
                          console.log(e);
                        }
                      }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                      }}
                    >
                      <Text style={{ fontWeight: "800" }}>APROBAR</Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        try {
                          await updateRequestStatus({
                            propertyId,
                            requestId: item.id,
                            status: "REJECTED",
                          });
                          await load();
                        } catch (e) {
                          console.log(e);
                        }
                      }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "red",
                      }}
                    >
                      <Text style={{ fontWeight: "800", color: "red" }}>
                        RECHAZAR
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
