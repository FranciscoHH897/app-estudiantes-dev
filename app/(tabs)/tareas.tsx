import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Colors } from "@/constants/theme";
import { db } from "@/src/api/firebase";
import { Task, TaskPriority } from "@/src/domain/task";
import { useAuth } from "@/src/lib/auth-context";

export default function TareasScreen() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"mis_tareas" | "asignadas">("mis_tareas");

  useEffect(() => {
    if (!user) return;

    let q;
    if (profile?.rol === "profesor" && viewMode === "asignadas") {
      q = query(
        collection(db, "tasks"),
        where("professorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        orderBy("fechaEntrega", "asc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      if (profile?.rol === "profesor" && viewMode === "asignadas") {
          // Agrupar por groupId para que el profesor vea una fila por tarea asignada
          const groups: Record<string, any> = {};
          docs.forEach(task => {
              if (!task.groupId) return;
              if (!groups[task.groupId]) {
                  groups[task.groupId] = {
                      id: task.groupId, // Usamos el groupId como ID virtual
                      titulo: task.titulo,
                      materiaNombre: task.materiaNombre,
                      prioridad: task.prioridad,
                      total: 0,
                      completadas: 0,
                      isGroup: true,
                      materiaId: task.materiaId
                  };
              }
              groups[task.groupId].total++;
              if (task.completada) groups[task.groupId].completadas++;
          });
          setTasks(Object.values(groups));
      } else {
          setTasks(docs);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, viewMode, profile]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        completada: !currentStatus
      });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const deleteTask = async (taskId: string, isGroup?: boolean) => {
    Alert.alert(
      "Eliminar Tarea",
      "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (isGroup) {
                const batch = writeBatch(db);
                const q = query(collection(db, "tasks"), where("groupId", "==", taskId));
                const snapshot = await getDocs(q);
                snapshot.forEach((docSnap) => {
                  batch.delete(docSnap.ref);
                });
                await batch.commit();
                Alert.alert("Éxito", "Grupo de tareas eliminado correctamente.");
              } else {
                await deleteDoc(doc(db, "tasks", taskId));
              }
            } catch (error) {
              console.error("Error al eliminar tarea:", error);
              Alert.alert("Error", "No se pudo eliminar la tarea.");
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "alta": return "#EF4444";
      case "media": return "#F59E0B";
      case "baja": return "#10B981";
      default: return "#6B7280";
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => viewMode !== "asignadas" && toggleTask(item.id, item.completada)}
        disabled={viewMode === "asignadas"}
      >
        <Ionicons
          name={item.completada ? "checkbox" : "square-outline"}
          size={24}
          color={item.completada ? "#10B981" : "#D1D5DB"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.content}
        onPress={() => {
          // @ts-ignore
          if (item.isGroup) {
            router.push({ 
              pathname: "/admin/task-tracking", 
              // @ts-ignore
              params: { groupId: item.id, titulo: item.titulo } 
            });
          } else {
            router.push({ pathname: "/modals/view-task" as any, params: { id: item.id } });
          }
        }}
      >
        <Text style={[styles.title, item.completada && styles.completedText]} numberOfLines={1}>
          {/* @ts-ignore */}
          {item.titulo} {item.isGroup ? `(Grupo)` : (item.studentName ? `(${item.studentName})` : '')}
        </Text>
        <Text style={styles.details}>
          {/* @ts-ignore */}
          {item.isGroup ? `Progreso: ${item.completadas}/${item.total} entregadas` : item.materiaNombre || "General"}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.prioridad) }]}>
            <Text style={styles.priorityText}>{item.prioridad}</Text>
          </View>
          {/* @ts-ignore */}
          {item.isGroup && (
             <View style={[styles.priorityBadge, { backgroundColor: "#3B82F6", marginLeft: 8 }]}>
                <Text style={styles.priorityText}>{item.materiaNombre}</Text>
             </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        {(!item.isGroup && !(profile?.rol === "estudiante" && item.isAssigned)) && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push({ pathname: "/modals/add-task", params: { id: item.id } })}
          >
            <Ionicons name="pencil-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
        )}
        {!(profile?.rol === "estudiante" && item.isAssigned) && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => deleteTask(item.id, item.isGroup)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
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
      {profile?.rol === "profesor" && (
        <View style={{ flexDirection: 'row', padding: 16, gap: 10, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <TouchableOpacity
            style={[styles.actionButton, viewMode === "mis_tareas" && { backgroundColor: Colors.light.tint }]}
            onPress={() => setViewMode("mis_tareas")}
          >
            <Text style={{ color: viewMode === "mis_tareas" ? "#FFF" : "#000", fontWeight: '700' }}>Mis Tareas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, viewMode === "asignadas" && { backgroundColor: Colors.light.tint }]}
            onPress={() => setViewMode("asignadas")}
          >
            <Text style={{ color: viewMode === "asignadas" ? "#FFF" : "#000", fontWeight: '700' }}>Seguimiento</Text>
          </TouchableOpacity>
        </View>
      )}
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
          <Text style={styles.emptySubtitle}>Disfruta de tu tiempo libre o registra un nuevo pendiente.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/modals/add-task")}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  checkButton: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  details: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
