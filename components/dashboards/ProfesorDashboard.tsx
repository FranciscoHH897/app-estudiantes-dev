import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import DashboardHero from "./DashboardHero";
import { useClasses } from "@/hooks/use-classes";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useMemo } from "react";

type Props = {
  nombre?: string;
};

export default function ProfesorDashboard({ nombre }: Props) {
  const { professorClasses } = useClasses();
  const classIds = useMemo(() => professorClasses.map(c => c.id), [professorClasses]);
  const { useNewEnrollmentsCount } = useEnrollments();
  const newStudentsCount = useNewEnrollmentsCount(classIds);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DashboardHero 
        saludo="¡Buen día," 
        nombre={nombre} 
        fallbackName="Profesor" 
        roleText="Personal Docente Académico" 
      />

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/perfil")}>
          <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="person" size={22} color="#0284C7" />
          </View>
          <Text style={styles.cardTitle}>Mi Perfil</Text>
          <Text style={styles.cardText}>Configura tu cuenta.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push("/admin/manage-classes")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="people" size={22} color="#9333EA" />
            {newStudentsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newStudentsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle}>Mis Alumnos</Text>
          <Text style={styles.cardText}>Gestiona los inscritos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/horarios")}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="time" size={22} color="#EA580C" />
          </View>
          <Text style={styles.cardTitle}>Horarios</Text>
          <Text style={styles.cardText}>Gestiona tus sesiones.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push("/avisos")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="megaphone" size={22} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Avisos</Text>
          <Text style={styles.cardText}>Panel institucional.</Text>
        </TouchableOpacity>
      </View>

      {/* Stats/Status Section - Commented until Phase 3/4 */}
      {/* 
      <View style={styles.statusSection}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Clases Hoy</Text>
          <Text style={styles.statusValue}>4</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Alumnos</Text>
          <Text style={styles.statusValue}>128</Text>
        </View>
      </View>
      */}
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
  statusSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.tint,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  }
});