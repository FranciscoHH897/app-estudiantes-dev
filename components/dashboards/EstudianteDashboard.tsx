import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import DashboardHero from "./DashboardHero";
import { useGrades } from "@/hooks/use-grades";
import { router } from "expo-router";
import { useMemo } from "react";

type Props = {
  nombre?: string;
};

export default function EstudianteDashboard({ nombre }: Props) {
  const { grades, loading } = useGrades();

  const academicStats = useMemo(() => {
    if (grades.length === 0) return { average: "N/A", progress: "0%" };

    // Agrupamos por materia para sacar el promedio ponderado de cada una
    const gradesBySubject: Record<string, { weightedSum: number; weightSum: number }> = {};
    
    grades.forEach(g => {
      if (!gradesBySubject[g.classId]) {
        gradesBySubject[g.classId] = { weightedSum: 0, weightSum: 0 };
      }
      gradesBySubject[g.classId].weightedSum += g.nota * (g.porcentaje / 100);
      gradesBySubject[g.classId].weightSum += g.porcentaje;
    });

    const subjectAverages = Object.values(gradesBySubject).map(s => s.weightedSum);
    const generalAverage = subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length;

    return {
      average: generalAverage.toFixed(1),
      progress: "En curso"
    };
  }, [grades]);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DashboardHero 
        saludo="¡Hola," 
        nombre={nombre} 
        fallbackName="Estudiante" 
        roleText="Alumno de Licenciatura" 
      />

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/perfil")}>
          <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="person" size={22} color="#0284C7" />
          </View>
          <Text style={styles.cardTitle}>Mi Perfil</Text>
          <Text style={styles.cardText}>Edita tus datos personales.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/horarios")}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="calendar" size={22} color="#EA580C" />
          </View>
          <Text style={styles.cardTitle}>Horarios</Text>
          <Text style={styles.cardText}>Materias y salones.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/tareas")}>
          <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="list" size={22} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Tareas</Text>
          <Text style={styles.cardText}>Gestiona tus entregas.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/notas")}>
          <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="stats-chart" size={22} color="#9333EA" />
          </View>
          <Text style={styles.cardTitle}>Notas</Text>
          <Text style={styles.cardText}>Promedios actuales.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.cardFull} 
        onPress={() => router.push("/avisos")}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="notifications" size={22} color="#0284C7" />
        </View>
        <View>
          <Text style={styles.cardTitle}>Avisos</Text>
          <Text style={styles.cardText}>Notificaciones institucionales importantes.</Text>
        </View>
      </TouchableOpacity>

      {/* Stats/Status Section */}
      <View style={styles.statusSection}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Promedio General</Text>
          <Text style={styles.statusValue}>{academicStats.average}</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Estado Académico</Text>
          <Text style={styles.statusValue}>{academicStats.progress}</Text>
        </View>
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
  },
  cardFull: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
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
  statusDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  }
});