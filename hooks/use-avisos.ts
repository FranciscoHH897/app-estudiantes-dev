import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { Aviso } from "@/src/domain/aviso";

export function useAvisos() {
  const { profile } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const audiencias: string[] = ["todos"];
    if (profile.rol === "estudiante") audiencias.push("estudiantes");
    if (profile.rol === "profesor") audiencias.push("profesores");

    const q = query(
      collection(db, "avisos"),
      where("audiencia", "in", audiencias)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Aviso[];
      data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setAvisos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  return { avisos, loading };
}
