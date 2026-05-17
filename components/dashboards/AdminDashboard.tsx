import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import DashboardHero from "./DashboardHero";

type Props = {
  nombre?: string;
};

export default function AdminDashboard({ nombre }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DashboardHero 
        saludo="¡Hola," 
        nombre={nombre} 
        fallbackName="Administrador" 
        roleText="Personal Administrativo" 
      />

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/perfil")}>
          <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="person" size={22} color="#0284C7" />
          </View>
          <Text style={styles.cardTitle}>Mi Perfil</Text>
          <Text style={styles.cardText}>Consulta y edita tus datos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/usuarios")}>
          <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="people" size={22} color="#9333EA" />
          </View>
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardText}>Gestión de roles y cuentas.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push("/avisos")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="megaphone" size={22} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Avisos</Text>
          <Text style={styles.cardText}>Administra avisos generales.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => Alert.alert("Próximamente", "Esta función estará disponible en una fase posterior.")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="settings" size={22} color="#475569" />
          </View>
          <Text style={styles.cardTitle}>Configuración</Text>
          <Text style={styles.cardText}>Parámetros del sistema.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});