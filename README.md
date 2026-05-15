# Sistema de Gestión Académica Colaborativa

Plataforma educativa integral desarrollada con **React Native (Expo)** y **Firebase**, diseñada para la Benemérita Universidad Autónoma de Puebla (BUAP). La aplicación centraliza el ecosistema académico digital conectando a estudiantes, profesores y administradores en un solo entorno colaborativo.

---

## Tecnologías del Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native con Expo (SDK 51+) |
| Navegación | Expo Router (file-based routing) |
| Base de Datos | Firebase Firestore (tiempo real) |
| Autenticación | Firebase Authentication |
| Lenguaje | TypeScript estricto |
| Estilo | React Native StyleSheet + Paleta BUAP |

---

## Arquitectura de Directorios

```
app/
  (auth)/         -- Pantallas de login y registro
  (tabs)/         -- Navegación principal por pestañas
    horarios.tsx  -- Vista de materias del usuario
    tareas.tsx    -- Gestión de tareas (personal y colaborativa)
    notas.tsx     -- Dashboard de calificaciones
    catalogo.tsx  -- Catálogo de clases disponibles (sólo estudiantes)
    mapa.tsx      -- Mapa gráfico del plan de estudios
  admin/
    usuarios.tsx         -- Gestión de usuarios del sistema
    manage-classes.tsx   -- Gestión de materias (admin)
    manage-students.tsx  -- Lista de alumnos por clase (profesor)
    task-tracking.tsx    -- Seguimiento de entregas por tarea grupal
  modals/
    add-schedule.tsx   -- Alta/edición de clase (profesor)
    add-task.tsx       -- Alta/edición de tarea
    add-grade.tsx      -- Registro manual de calificación
    grade-task.tsx     -- Calificación de entrega de tarea (profesor)
    view-grades.tsx    -- Desglose de notas por materia
    view-task.tsx      -- Detalle de tarea (con entrega de evidencia)
    view-schedule.tsx  -- Detalle de clase
  perfil.tsx           -- Perfil y configuración del usuario
  visualizador-horario.tsx -- Vista semanal de horario

components/
  dashboards/
    EstudianteDashboard.tsx  -- Dashboard principal del estudiante
    ProfesorDashboard.tsx    -- Dashboard principal del profesor

hooks/
  use-grades.ts         -- Suscripción en tiempo real a calificaciones
  use-classes.ts        -- Catálogo y clases del profesor
  use-enrollments.ts    -- Inscripciones del estudiante y miembros de clase

src/
  domain/
    user.ts         -- Tipos de perfiles (Estudiante, Profesor, Admin)
    task.ts         -- Modelo de Tarea con campos LMS
    grade.ts        -- Modelo de Calificación con porcentajes
    class.ts        -- Modelo de Clase/Materia
    enrollment.ts   -- Modelo de Inscripción
    study-plan.ts   -- Planes de estudio BUAP y materias
  lib/
    auth-context.tsx  -- Contexto global de autenticación
  api/
    firebase.ts       -- Configuración e inicialización de Firebase
```

---

## Sistema de Roles y Permisos

La aplicación cuenta con tres roles diferenciados, cada uno con una experiencia de usuario independiente:

### Rol: Estudiante

**Registro:**
- Nombre completo, correo institucional y matrícula.
- Selección del plan de estudios activo (Anterior 2016, 2016-2023 o 2024).
- Carrera, semestre y área de interés.

**Pestañas disponibles:**
- **Horarios:** Visualización de materias inscritas con salón, días y horario.
- **Tareas:** Listado de tareas personales y tareas asignadas por profesores, con posibilidad de subir evidencias y marcar entregas.
- **Notas:** Dashboard con promedio general calculado de forma ponderada y desglose por materia.
- **Explorar:** Catálogo de clases disponibles con buscador por nombre de materia o profesor, con inscripción en un solo tap.
- **Mapa:** Mapa gráfico interactivo del plan de estudios que muestra el estado de cada materia (Aprobada, Cursando, Reprobada, Pendiente) basado en inscripciones y calificaciones reales.

### Rol: Profesor

**Registro:**
- Nombre completo, correo y número de empleado.
- Departamento y materias asignadas.

**Pestañas disponibles:**
- **Horarios:** Lista de materias creadas con opción de edición y eliminación. Botón flotante para crear nuevas materias con color, salón, días y horario.
- **Tareas:** Vista en modo "Mis Tareas" (tareas personales) y modo "Seguimiento" (tareas asignadas a clases, agrupadas por grupo con contador de progreso: "N/Total entregadas").
- **Notas:** Lista de clases del profesor. Al seleccionar una clase, navega a la lista de alumnos inscritos con sus calificaciones.
- **Mapa:** Explorador de planes de estudio institucionales para consultar las mallas curriculares sin datos personales de alumno.

**Funciones exclusivas:**
- Creación y edición de materias.
- Asignación masiva de tareas a toda una clase (fan-out automático por inscripciones activas).
- Panel de seguimiento de entregas por tarea grupal.
- Calificación individual de entregas con sincronización automática al historial del alumno.
- Registro manual de notas parciales con porcentaje de peso.

### Rol: Administrador

- Gestión completa del listado de usuarios.
- Edición de roles, activación y desactivación de cuentas.
- Acceso a la gestión de clases del sistema.

---

## Modelo de Datos (Firestore)

### Colección: `users`

```typescript
{
  uid: string;
  nombre: string;
  email: string;
  rol: "estudiante" | "profesor" | "admin";
  activo: boolean;
  // Si es estudiante:
  matricula?: string;
  carrera?: string;
  semestre?: number;
  planEstudio?: "Anterior 2016" | "2016-2023" | "2024";
  // Si es profesor:
  numeroEmpleado?: string;
  departamento?: string;
}
```

### Colección: `classes`

```typescript
{
  materia: string;
  profesorId: string;
  profesorNombre: string;
  salon: string;
  dias: string[];          // ["Lunes", "Miércoles"]
  horaInicio: string;      // "07:00"
  horaFin: string;         // "09:00"
  color: string;           // Color hex para UI
  createdAt: Timestamp;
}
```

### Colección: `enrollments`

```typescript
{
  studentId: string;
  studentNombre: string;
  classId: string;
  status: "active" | "inactive";
  viewedByProfessor: boolean;
  createdAt: Timestamp;
}
```

### Colección: `tasks`

```typescript
{
  userId: string;           // Propietario/destinatario de la tarea
  professorId?: string;     // UID del profesor que asignó la tarea
  isAssigned?: boolean;     // True si fue generada por asignación masiva
  groupId?: string;         // ID compartido entre todas las copias de una misma asignación grupal
  studentName?: string;     // Nombre del alumno (para la vista del profesor)
  titulo: string;
  descripcion: string;
  materiaId: string;
  materiaNombre?: string;
  fechaEntrega: Timestamp;
  prioridad: "baja" | "media" | "alta";
  tipo?: string;            // "Tarea", "Examen", "Proyecto"
  completada: boolean;
  entregableTipo?: "github" | "archivo" | "url" | "otro";
  entregableUrl?: string;   // Link subido por el alumno como evidencia
  porcentaje?: number;      // Peso de la tarea en la nota final (0-100)
  calificada?: boolean;     // True cuando el profesor ha registrado nota
  calificacion?: number;    // Nota numérica (0-10)
  gradeId?: string;         // ID del documento en la colección grades vinculado
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Colección: `grades`

```typescript
{
  userId: string;           // Estudiante calificado
  classId: string;          // Materia a la que pertenece la nota
  professorId: string;      // Profesor que registró la nota
  nombreParcial: string;    // Ej: "Primer Parcial" o "Tarea: Nombre de tarea"
  nota: number;             // Valor 0-10
  porcentaje: number;       // Peso dentro del promedio final (0-100)
  createdAt: Timestamp;
}
```

---

## Flujo LMS: Ciclo de Vida Completo de una Tarea Asignada

```
1. CREACION (Profesor)
   -- El profesor crea una tarea desde add-task.tsx
   -- Selecciona una clase, define título, descripción, tipo de entregable y porcentaje de peso
   -- El sistema consulta todos los enrollments activos de esa clase

2. DISTRIBUCION (Sistema - Fan-out)
   -- Se genera un groupId único (UUID)
   -- Para cada alumno inscrito se crea un documento en la colección tasks con:
      * userId = alumno
      * professorId = profesor
      * groupId = el mismo UUID compartido
      * isAssigned = true
      * studentName = nombre del alumno

3. VISUALIZACION DEL ALUMNO (Pestaña Tareas)
   -- El alumno ve la tarea en su lista con estado "Pendiente"
   -- Al entrar al detalle (view-task.tsx) encuentra:
      * Título, descripción, materia y porcentaje de peso
      * Campo de texto para pegar el link de su evidencia (GitHub, URL, etc.)
      * Botón "Enviar Tarea" que cambia el estado a completada = true
      * Una vez enviada, el campo se bloquea (solo desbloqueable presionando "Deshacer Entrega")

4. SEGUIMIENTO DEL PROFESOR (Pestaña Tareas, modo Seguimiento)
   -- El profesor ve una sola fila por tarea grupal con el contador "N/Total entregadas"
   -- Al presionar, navega a task-tracking.tsx con la lista de todos los alumnos:
      * Nombre del alumno
      * Estado (Pendiente / Entregada)
      * Badge de nota si ya fue calificada

5. CALIFICACION (grade-task.tsx)
   -- El profesor abre la tarea de un alumno específico
   -- Ve el link de evidencia (abre directamente en el navegador)
   -- Ingresa la nota numérica (0-10)
   -- Al guardar:
      a. Si es la primera calificación: se crea un documento en la colección grades
         y se guarda el gradeId en el documento de la tarea
      b. Si ya fue calificada antes: se actualiza el documento existente en grades
         (sin duplicados)
      c. La tarea se actualiza con calificada = true, calificacion y gradeId

6. IMPACTO EN EL PROMEDIO
   -- El hook use-grades.ts recibe la actualización en tiempo real
   -- notas.tsx recalcula el promedio ponderado de forma automática
   -- El dashboard del estudiante (EstudianteDashboard.tsx) refleja el nuevo promedio general
```

---

## Mapa Gráfico de Planes de Estudio

El módulo de Mapa (`mapa.tsx`) provee una visualización interactiva de la trayectoria académica:

- **Planes soportados:** Anterior 2016, 2016-2023, 2024.
- **Estado de cada materia:**
  - **Aprobada (Dorado BUAP):** La materia tiene promedio calculado >= 6.0.
  - **Cursando (Azul BUAP):** El alumno está inscrito pero sin calificaciones registradas aún.
  - **Reprobada (Rojo):** La materia tiene promedio < 6.0.
  - **Pendiente (Gris):** No hay inscripción activa para esa materia.
- **Vista del Profesor:** Permite explorar cualquier plan de estudios institucional sin datos personales.
- Al tocar una materia se muestra un resumen con el promedio parcial y el porcentaje de avance registrado.

---

## Cálculo de Promedios

El sistema calcula promedios ponderados para reflejar el peso real de cada evaluación:

```
Promedio de Materia = Suma de (nota_i * porcentaje_i / 100)
Promedio General   = Media aritmética de los promedios de todas las materias con notas registradas
```

- Si una materia tiene `porcentaje total < 100`, el promedio mostrado es parcial.
- Una materia se considera "con evaluación completa" cuando `weightSum == 100`.
- La barra de progreso en la vista de Notas refleja el porcentaje de materias con evaluación completa.

---

## Seguridad y Reglas de Firestore

- Los estudiantes pueden leer y escribir únicamente en sus propios documentos de tareas (`userId == request.auth.uid`).
- Los profesores pueden leer las tareas de sus alumnos solo si `professorId == request.auth.uid`.
- Únicamente los administradores pueden modificar los campos de perfil de otros usuarios.
- Las reglas de seguridad se encuentran en el archivo `firestore.rules` en la raíz del proyecto.

---

## Configuración e Instalación

**Prerrequisitos:**
- Node.js 18 o superior
- Expo CLI instalado globalmente
- Proyecto de Firebase creado con Firestore y Authentication habilitados

**Variables de entorno (`.env.local`):**
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

**Instalación:**
```bash
npm install
npx expo start
```

Para ejecutar en dispositivo físico, escanear el QR con la aplicación Expo Go o compilar con EAS Build para producción.

---

## Índices de Firestore Requeridos

La aplicación requiere los siguientes índices compuestos en Firestore para que las consultas funcionen correctamente:

| Colección | Campo 1 | Campo 2 | Orden |
|---|---|---|---|
| tasks | professorId (ASC) | createdAt (DESC) | -- |
| tasks | groupId (ASC) | professorId (ASC) | studentName (ASC) |

Estos índices se pueden crear desde la consola de Firebase o mediante el enlace que aparece automáticamente en los logs cuando se ejecuta la consulta por primera vez.
