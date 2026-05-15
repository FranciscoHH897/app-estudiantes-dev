import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Alert
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { useGrades } from "@/hooks/use-grades";
import { ClassModel } from "@/src/domain/class";
import { Colors } from "@/constants/theme";

export default function ViewGradesScreen() {
  const { classId, studentId, studentName } = useLocalSearchParams<{ 
    classId: string; 
    studentId?: string; 
    studentName?: string 
  }>();
  const [classData, setClassData] = useState<ClassModel | null>(null);
  const { grades, loading: gradesLoading } = useGrades(classId, studentId);
  const [loadingClass, setLoadingClass] = useState(true);

  useEffect(() => {
    const fetchClassInfo = async () => {
      if (!classId) {
        setLoadingClass(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "classes", classId));
        if (docSnap.exists()) {
          setClassData({ id: docSnap.id, ...docSnap.data() } as ClassModel);
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchClassInfo();
  }, [classId]);

  const deleteGrade = (gradeId: string) => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro de que deseas eliminar esta calificación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "grades", gradeId));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la nota.");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.gradeCard}>
      <View style={styles.gradeInfo}>
        <Text style={styles.gradeTitle}>{item.nombreParcial}</Text>
        <Text style={styles.gradeWeight}>Peso: {item.porcentaje}%</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.nota?.toFixed(1) || "0.0"}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteGrade(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (loadingClass || gradesLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{studentName || classData?.materia}</Text>
        <Text style={styles.headerSubtitle}>
          {studentName ? `Notas para ${classData?.materia}` : "Desglose de calificaciones"}
        </Text>
      </View>

      <FlatList
        data={grades}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay notas registradas.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({ 
          pathname: "/modals/add-grade", 
          params: { classId, targetUserId: studentId, targetUserName: studentName } 
        })}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
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
  header: {
    padding: 24,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  gradeCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  gradeWeight: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: "#EFF6FF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.light.tint,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
  },
});
