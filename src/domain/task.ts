export type TaskPriority = "baja" | "media" | "alta";

export interface Task {
  id: string;              // ID único (ID de Firestore)
  userId: string;          // Dueño de la tarea
  professorId?: string;    // UID del profesor que asignó la tarea
  isAssigned?: boolean;    // Flag para saber si fue asignada
  studentName?: string;    // Nombre del alumno (para la vista del profesor)
  groupId?: string;        // ID para agrupar todas las copias de una misma tarea
  titulo: string;          // Nombre corto de la tarea
  descripcion: string;     // Descripción detallada
  materiaId: string;       // ID de la materia (ClassId en el nuevo modelo)
  materiaNombre?: string;  
  fechaEntrega: any;       
  prioridad: TaskPriority; 
  completada: boolean;     
  calificada?: boolean;    // Si el profesor ya la calificó
  calificacion?: number;   // Nota obtenida
  gradeId?: string;        // ID del documento en la colección grades
  porcentaje?: number;     // Porcentaje del parcial (ej: 20%)
  tipo?: string;           // Examen, Trabajo, Proyecto
  professorName?: string;  // Nombre del profesor (para el alumno)
  entregableTipo?: "github" | "archivo" | "url" | "otro"; // Tipo de entregable
  entregableUrl?: string;  // Link a GitHub, URL de archivo, etc.
  createdAt: unknown;      
}
