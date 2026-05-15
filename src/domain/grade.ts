export interface Grade {
  id: string;          // ID de Firestore
  userId: string;      // ID del estudiante
  profesorId: string;   // ID del profesor que puso la nota
  classId: string;     // ID de la materia relacionada (ClassModel)
  nombreParcial: string; // Ej: "Primer Parcial"
  nota: number;        // Valor numérico (0-10)
  porcentaje: number;   // Peso de la nota (0-100)
  createdAt?: any;     // Timestamp opcional
}
