export type AvisoAudience = "todos" | "estudiantes" | "profesores";

export interface Aviso {
  id: string;
  titulo: string;
  contenido: string;
  audiencia: AvisoAudience;
  autorNombre: string;
  createdAt: any;
}
