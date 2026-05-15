import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { Task } from "@/src/domain/task";
import { Colors } from "@/constants/theme";

export default function GradeTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    
    const fetchTask = async () => {
      try {
        const docSnap = await getDoc(doc(db, "tasks", taskId));
        if (docSnap.exists()) {
          const data = docSnap.id ? { id: docSnap.id, ...docSnap.data() } as Task : null;
          setTask(data);
          if (data?.calificacion) setNota(data.calificacion.toString());
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleOpenLink = () => {
    if (task?.entregableUrl) {
      Linking.openURL(task.entregableUrl).catch(() => {
        Alert.alert("Error", "No se pudo abrir el enlace.");
      });
    }
  };

  const handleSave = async () => {
    if (!task) return;
    const notaNum = parseFloat(nota);

    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      Alert.alert("Valor inválido", "La nota debe ser un número entre 0 y 10.");
      return;
    }

    try {
      setSaving(true);
      
      // 1. Manejar la colección Grades
      let currentGradeId = task.gradeId;
      
      if (currentGradeId) {
        // Actualizar nota existente
        await updateDoc(doc(db, "grades", currentGradeId), {
          nota: notaNum,
          porcentaje: task.porcentaje || 0,
        });
      } else {
        // Crear nota nueva
        const newGradeRef = await addDoc(collection(db, "grades"), {
          userId: task.userId,
          classId: task.materiaId,
          professorId: task.professorId,
          nombreParcial: `Tarea: ${task.titulo}`,
          nota: notaNum,
          porcentaje: task.porcentaje || 0,
          createdAt: serverTimestamp(),
        });
        currentGradeId = newGradeRef.id;
      }

      // 2. Actualizar la tarea
      await updateDoc(doc(db, "tasks", task.id), {
        calificada: true,
        calificacion: notaNum,
        gradeId: currentGradeId,
        updatedAt: serverTimestamp()
      });

      Alert.alert("Éxito", "Calificación registrada y enviada al sistema de notas.");
      router.back();
    } catch (error) {
      console.error("Error saving grade:", error);
      Alert.alert("Error", "No se pudo guardar la calificación.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Calificar Entrega</Text>
          <Text style={styles.studentName}>{task?.studentName}</Text>
          <Text style={styles.taskTitle}>{task?.titulo}</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>Peso: {task?.porcentaje || 0}% de la nota</Text>
          </View>

          <View style={styles.evidenceBox}>
            <Text style={styles.label}>Evidencia ({task?.entregableTipo})</Text>
            {task?.entregableUrl ? (
              <TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
                <Ionicons name="link-outline" size={20} color="#2563EB" />
                <Text style={styles.linkText} numberOfLines={1}>{task.entregableUrl}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noEvidence}>Sin link de evidencia registrado.</Text>
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Calificación Final (0-10)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 9.5"
              keyboardType="numeric"
              value={nota}
              onChangeText={setNota}
            />

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.disabledButton]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Guardando..." : "Registrar Calificación"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    marginTop: 4,
  },
  taskTitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 24,
  },
  evidenceBox: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
    flex: 1,
  },
  noEvidence: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButton: {
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },
});
