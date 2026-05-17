import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { useAvisos } from "@/hooks/use-avisos";
import { Aviso, AvisoAudience } from "@/src/domain/aviso";
import { Colors } from "@/constants/theme";

const AUDIENCE_LABELS: Record<AvisoAudience, string> = {
  todos: "Todos",
  estudiantes: "Estudiantes",
  profesores: "Profesores",
};

const AUDIENCE_COLORS: Record<AvisoAudience, string> = {
  todos: "#3B82F6",
  estudiantes: "#10B981",
  profesores: "#F59E0B",
};

export default function AvisosScreen() {
  const { profile } = useAuth();
  const { avisos, loading } = useAvisos();
  const isAdmin = profile?.rol === "admin";

  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [audiencia, setAudiencia] = useState<AvisoAudience>("todos");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!titulo.trim() || !contenido.trim()) {
      Alert.alert("Campos requeridos", "Completa el título y el contenido.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "avisos"), {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        audiencia,
        autorNombre: profile?.nombre ?? "Admin",
        createdAt: serverTimestamp(),
      });
      setTitulo("");
      setContenido("");
      setAudiencia("todos");
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo publicar el aviso.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar aviso", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteDoc(doc(db, "avisos", id)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Aviso }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.audienceBadge, { backgroundColor: AUDIENCE_COLORS[item.audiencia] + "20" }]}>
          <Text style={[styles.audienceText, { color: AUDIENCE_COLORS[item.audiencia] }]}>
            {AUDIENCE_LABELS[item.audiencia]}
          </Text>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      <Text style={styles.cardContent}>{item.contenido}</Text>
      <Text style={styles.cardAuthor}>— {item.autorNombre}</Text>
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
      {avisos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Sin avisos</Text>
          <Text style={styles.emptySubtitle}>No hay avisos institucionales por el momento.</Text>
        </View>
      ) : (
        <FlatList
          data={avisos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Aviso</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ej: Suspensión de clases"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Contenido</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contenido}
                onChangeText={setContenido}
                placeholder="Describe el aviso..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Audiencia</Text>
              <View style={styles.audienceRow}>
                {(Object.keys(AUDIENCE_LABELS) as AvisoAudience[]).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.audienceOption,
                      audiencia === key && { backgroundColor: AUDIENCE_COLORS[key], borderColor: AUDIENCE_COLORS[key] },
                    ]}
                    onPress={() => setAudiencia(key)}
                  >
                    <Text style={[styles.audienceOptionText, audiencia === key && { color: "#FFF" }]}>
                      {AUDIENCE_LABELS[key]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, saving && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                <Text style={styles.submitText}>{saving ? "Publicando..." : "Publicar Aviso"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  audienceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  audienceText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardAuthor: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  audienceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  audienceOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  audienceOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  submitText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
