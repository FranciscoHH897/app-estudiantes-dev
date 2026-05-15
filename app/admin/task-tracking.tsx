import React, { useEffect, useState } from "react";
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { Task } from "@/src/domain/task";
import { Colors } from "@/constants/theme";

import { useAuth } from "@/src/lib/auth-context";

export default function TaskTrackingScreen() {
  const { user } = useAuth();
  const { groupId, titulo } = useLocalSearchParams<{ groupId: string; titulo: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !user) return;

    const q = query(
      collection(db, "tasks"),
      where("groupId", "==", groupId),
      where("professorId", "==", user.uid),
      orderBy("studentName", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ 
        pathname: "/modals/grade-task", 
        params: { taskId: item.id } 
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.studentName?.charAt(0) || "?"}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.studentName}>{item.studentName || "Alumno"}</Text>
        <View style={styles.statusRow}>
          <Ionicons 
            name={item.completada ? "checkmark-circle" : "time-outline"} 
            size={16} 
            color={item.completada ? "#10B981" : "#F59E0B"} 
          />
          <Text style={[styles.statusText, { color: item.completada ? "#10B981" : "#F59E0B" }]}>
            {item.completada ? "Entregada" : "Pendiente"}
          </Text>
          {item.calificada && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>Nota: {item.calificacion}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.subtitle}>Seguimiento de entrega</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No se encontraron alumnos para esta tarea.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    maxWidth: 250,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B5563",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  gradeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
  },
});
