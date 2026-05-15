import { useEffect, useState } from "react";
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator
} from "react-native";
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    doc,
    getDoc,
    updateDoc,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { TaskPriority } from "@/src/domain/task";
import { useClasses } from "@/hooks/use-classes";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Colors } from "@/constants/theme";

export default function AddTaskScreen() {
  const { user, profile } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Hooks de datos
  const { professorClasses } = useClasses();
  const { myEnrollments } = useEnrollments();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [prioridad, setPrioridad] = useState<TaskPriority>("media");
  const [entregableTipo, setEntregableTipo] = useState<"github" | "archivo" | "url" | "otro">("github");
  const [entregableUrl, setEntregableUrl] = useState("");
  const [porcentaje, setPorcentaje] = useState("0");
  const [loading, setLoading] = useState(false);

  // Lista de materias disponibles según el rol
  const availableClasses = profile?.rol === "profesor" 
    ? professorClasses 
    : myEnrollments.map(e => e.classData).filter(Boolean);

  useEffect(() => {
    if (!id) return;
    
    const fetchTask = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "tasks", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitulo(data.titulo);
          setDescripcion(data.descripcion);
          setMateriaId(data.materiaId || "");
          setPrioridad(data.prioridad);
          setEntregableTipo(data.entregableTipo || "github");
          setEntregableUrl(data.entregableUrl || "");
          setPorcentaje(data.porcentaje?.toString() || "0");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleSave = async () => {
    if (!titulo) {
      Alert.alert("Error", "Por favor ingresa un título.");
      return;
    }

    try {
      setLoading(true);
      const selectedClass = availableClasses.find(c => c!.id === materiaId);
      
      const baseTaskData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        materiaId: materiaId || null,
        materiaNombre: selectedClass ? selectedClass.materia : "General",
        prioridad,
        entregableTipo,
        entregableUrl: entregableUrl.trim(),
        porcentaje: parseFloat(porcentaje) || 0,
        updatedAt: serverTimestamp(),
      };

      if (id) {
          await updateDoc(doc(db, "tasks", id), baseTaskData);
      } else {
          if (profile?.rol === "profesor" && materiaId) {
             // 1. Obtener alumnos inscritos en esta materia
             const enrollmentsRef = collection(db, "enrollments");
             const q = query(enrollmentsRef, where("classId", "==", materiaId), where("status", "==", "active"));
             const snapshot = await getDocs(q);
             
             const groupId = Date.now().toString(); // Identificador común

             if (snapshot.empty) {
                Alert.alert("Aviso", "No hay alumnos inscritos en esta clase.");
                setLoading(false);
                return;
             }

             // 2. Crear una copia para cada alumno
             for (const docSnap of snapshot.docs) {
                const enrollment = docSnap.data();
                await addDoc(collection(db, "tasks"), {
                   ...baseTaskData,
                   userId: enrollment.studentId, // Asignada al alumno
                   studentName: enrollment.studentNombre,
                   professorId: user?.uid,       // Creada por este profesor
                   professorName: profile?.nombre || "Profesor",
                   isAssigned: true,
                   groupId: groupId,
                   completada: false,
                   fechaEntrega: serverTimestamp(),
                   createdAt: serverTimestamp(),
                });
             }
          } else {
             await addDoc(collection(db, "tasks"), {
                ...baseTaskData,
                userId: user?.uid,
                completada: false,
                fechaEntrega: serverTimestamp(),
                createdAt: serverTimestamp(),
             });
          }
      }

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título de la Tarea *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: Proyecto Final - Estructura de Datos"
          value={titulo}
          onChangeText={setTitulo}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Materia Relacionada</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={materiaId}
            onValueChange={(val) => setMateriaId(val)}
            style={styles.picker}
          >
            <Picker.Item label="Ninguna (General)" value="" />
            {availableClasses.map(c => (
              <Picker.Item key={c!.id} label={c!.materia} value={c!.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Prioridad</Text>
        <View style={styles.priorityContainer}>
          {(["baja", "media", "alta"] as TaskPriority[]).map(p => (
              <TouchableOpacity 
                  key={p}
                  style={[
                      styles.priorityBtn, 
                      prioridad === p && { backgroundColor: p === "alta" ? "#EF4444" : p === "media" ? "#F59E0B" : "#10B981" }
                  ]}
                  onPress={() => setPrioridad(p)}
              >
                  <Text style={[styles.priorityBtnText, prioridad === p && { color: "#FFF" }]}>
                      {p.toUpperCase()}
                  </Text>
              </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Entregable de Ingeniería</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={entregableTipo}
            onValueChange={(val) => setEntregableTipo(val)}
            style={styles.picker}
          >
            <Picker.Item label="GitHub (Repositorio)" value="github" />
            <Picker.Item label="Archivo (PDF/Zip)" value="archivo" />
            <Picker.Item label="URL (Externo)" value="url" />
            <Picker.Item label="Otro" value="otro" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Ionicons 
            name={entregableTipo === "github" ? "logo-github" : "link"} 
            size={16} 
            color="#6B7280" 
          />
          <Text style={styles.label}>Link de Referencia (Opcional)</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="https://github.com/..."
          value={entregableUrl}
          onChangeText={setEntregableUrl}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Porcentaje de la Nota (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 15"
          value={porcentaje}
          onChangeText={setPorcentaje}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Instrucciones o notas adicionales..."
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Guardando..." : (id ? "Actualizar Tarea" : "Crear Tarea")}
        </Text>
      </TouchableOpacity>
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
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
      height: 100,
      textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 10,
  },
  priorityBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#D1D5DB",
      alignItems: "center",
  },
  priorityBtnText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#6B7280",
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
});
