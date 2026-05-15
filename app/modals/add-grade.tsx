import { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { Colors } from "@/constants/theme";

export default function AddGradeScreen() {
  const { user } = useAuth();
  const { classId, targetUserId, targetUserName } = useLocalSearchParams<{ 
    classId: string;
    targetUserId?: string;
    targetUserName?: string;
  }>();

  const [nombreParcial, setNombreParcial] = useState("");
  const [nota, setNota] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    const effectiveUserId = targetUserId || user.uid;
    if (!effectiveUserId || !classId) return;

    if (!nombreParcial.trim() || !nota.trim() || !porcentaje.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa toda la información.");
      return;
    }

    const notaNum = parseFloat(nota);
    const porcentajeNum = parseFloat(porcentaje);

    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      Alert.alert("Valor inválido", "La nota debe ser un número entre 0 y 10.");
      return;
    }

    if (isNaN(porcentajeNum) || porcentajeNum < 1 || porcentajeNum > 100) {
      Alert.alert("Valor inválido", "El porcentaje debe ser un número entre 1 y 100.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "grades"), {
        userId: effectiveUserId,
        profesorId: user.uid,
        classId: classId,
        nombreParcial: nombreParcial.trim(),
        nota: notaNum,
        porcentaje: porcentajeNum,
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (error) {
      console.error("Error adding grade:", error);
      Alert.alert("Error", "No se pudo guardar la calificación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{targetUserName || "Nueva Calificación"}</Text>
          <Text style={styles.subtitle}>
            {targetUserName ? "Registrar nota para este alumno" : "Indica los detalles del parcial o actividad."}
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre de la evaluación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Primer Parcial"
              value={nombreParcial}
              onChangeText={setNombreParcial}
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Calificación (0-10)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 9.5"
                  keyboardType="numeric"
                  value={nota}
                  onChangeText={setNota}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.field}>
                <Text style={styles.label}>Peso (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 30"
                  keyboardType="numeric"
                  value={porcentaje}
                  onChangeText={setPorcentaje}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]} 
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Guardando..." : "Registrar Nota"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={loading}
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
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D9DDE7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  field: {
    flex: 1,
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
