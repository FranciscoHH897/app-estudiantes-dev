import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert
} from "react-native";

import { Colors } from "@/constants/theme";
import { db } from "@/src/api/firebase";
import { Task, TaskPriority } from "@/src/domain/task";
import { useAuth } from "@/src/lib/auth-context";

export default function ViewTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        const docRef = doc(db, "tasks", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Task;
          setTask(data);
          setEvidence(data.entregableUrl || "");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const toggleComplete = async () => {
    if (!task) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "tasks", task.id), {
        completada: !task.completada,
        entregableUrl: evidence.trim(),
        updatedAt: serverTimestamp()
      });
      setTask({ ...task, completada: !task.completada, entregableUrl: evidence.trim() });
      Alert.alert("Éxito", task.completada ? "Tarea marcada como pendiente" : "Tarea enviada con éxito");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la tarea");
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "alta": return "#EF4444";
      case "media": return "#F59E0B";
      case "baja": return "#10B981";
      default: return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró la tarea.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.titulo}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.prioridad) }]}>
          <Text style={styles.priorityText}>{task.prioridad.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="book-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Materia:</Text>
          <Text style={styles.infoValue}>{task.materiaNombre || "General"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>{task.tipo || "Tarea"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={task.completada ? "#10B981" : "#6B7280"} />
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={[styles.infoValue, task.completada && { color: "#10B981", fontWeight: "700" }]}>
            {task.completada ? (task.calificada ? `Calificada: ${task.calificacion}` : "Enviada / Completada") : "Pendiente"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="stats-chart-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Peso:</Text>
          <Text style={styles.infoValue}>{task.porcentaje || 0}% de la nota</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.label}>Descripción</Text>
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          {task.descripcion || "Sin descripción adicional."}
        </Text>
      </View>

      {profile?.rol === "estudiante" && (task.isAssigned || task.professorId) && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Mi Entrega (Link / GitHub)</Text>
          <TextInput
            style={[styles.input, (task.calificada || task.completada) && { backgroundColor: "#F3F4F6", color: "#9CA3AF" }]}
            placeholder="https://github.com/..."
            value={evidence}
            onChangeText={setEvidence}
            editable={!task.calificada && !task.completada}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              task.completada && { backgroundColor: "#6B7280" },
              task.calificada && { opacity: 0.5 }
            ]}
            onPress={toggleComplete}
            disabled={saving || task.calificada}
          >
            <Ionicons name={task.completada ? "refresh" : "cloud-upload"} size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>
              {saving ? "Procesando..." : (task.completada ? "Deshacer Entrega" : "Enviar Tarea")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {(!task.isAssigned || profile?.rol === "profesor") && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            router.back();
            router.push({ pathname: "/modals/add-task", params: { id: task.id } });
          }}
        >
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Editar Tarea</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: 16,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    width: 70,
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
    elevation: 1,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
