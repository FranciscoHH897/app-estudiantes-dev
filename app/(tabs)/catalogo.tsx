import React, { useState, useMemo } from "react";
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClasses } from "@/hooks/use-classes";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Colors } from "@/constants/theme";
import { ClassModel } from "@/src/domain/class";

export default function CatalogScreen() {
  const { catalog, loading: loadingClasses } = useClasses();
  const { enrollInClass, myEnrollments, loading: loadingEnrollments } = useEnrollments();
  const [search, setSearch] = useState("");

  const filteredCatalog = useMemo(() => {
    return catalog.filter(c => 
      c.materia.toLowerCase().includes(search.toLowerCase()) ||
      c.profesorNombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [catalog, search]);

  const handleEnroll = async (item: ClassModel) => {
    console.log("handleEnroll llamado para:", item.materia);
    const isEnrolled = myEnrollments.some(enr => enr.classId === item.id);
    console.log("¿Ya inscrito?", isEnrolled);
    
    if (isEnrolled) {
      Alert.alert("Ya inscrito", "Ya te encuentras inscrito en esta materia.");
      return;
    }

    // Para web, usar confirm en lugar de Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `¿Deseas inscribirte en la clase de ${item.materia} con el Prof. ${item.profesorNombre}?`
      );
      
      if (confirmed) {
        console.log("Confirmación aceptada");
        try {
          console.log("Llamando enrollInClass...");
          await enrollInClass(item);
          console.log("Inscripción exitosa");
          window.alert("Te has inscrito correctamente.");
        } catch (error: any) {
          console.error("Error en inscripción:", error);
          window.alert(`Error: ${error.message}`);
        }
      }
    } else {
      Alert.alert(
        "Confirmar Inscripción",
        `¿Deseas inscribirte en la clase de ${item.materia} con el Prof. ${item.profesorNombre}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Inscribirme", 
            onPress: async () => {
              console.log("Botón Inscribirme presionado");
              try {
                console.log("Llamando enrollInClass...");
                await enrollInClass(item);
                console.log("Inscripción exitosa");
                Alert.alert("Éxito", "Te has inscrito correctamente.");
              } catch (error: any) {
                console.error("Error en inscripción:", error);
                Alert.alert("Conflicto", error.message);
              }
            } 
          }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: ClassModel }) => {
    const isEnrolled = myEnrollments.some(enr => enr.classId === item.id);

    return (
      <View style={styles.card}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color || Colors.light.tint }]} />
        <View style={styles.cardContent}>
          <Text style={styles.subjectName}>{item.materia}</Text>
          <Text style={styles.professorName}>Prof. {item.profesorNombre}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.horaInicio} - {item.horaFin}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>{item.dias.join(", ")}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.enrollButton, isEnrolled && styles.enrolledButton]}
          onPress={() => {
            console.log("TouchableOpacity presionado!");
            handleEnroll(item);
          }}
          disabled={isEnrolled}
          activeOpacity={0.7}
        >
          <Text style={styles.enrollButtonText}>
            {isEnrolled ? "Inscrito" : "Inscribirse"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingClasses || loadingEnrollments) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por materia o profesor..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredCatalog}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No se encontraron materias.</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchHeader: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#111827",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: "hidden",
  },
  colorIndicator: {
    width: 6,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  professorName: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  enrollButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enrolledButton: {
    backgroundColor: "#10B981",
  },
  enrollButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});
