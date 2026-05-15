import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/src/lib/auth-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="perfil" options={{ headerShown: false }} />
            <Stack.Screen name="admin/usuarios" options={{ headerShown: false }} />
            <Stack.Screen name="admin/manage-classes" options={{ headerShown: true, title: "Gestionar Clases" }} />
            <Stack.Screen name="admin/manage-students" options={{ headerShown: false }} />
            <Stack.Screen name="admin/task-tracking" options={{ headerShown: false }} />
            
            <Stack.Screen name="modals/add-schedule" options={{ presentation: "modal", title: "Nueva Materia", headerShown: true }} />
            <Stack.Screen name="modals/add-task" options={{ presentation: "modal", title: "Nueva Tarea", headerShown: true }} />
            <Stack.Screen name="modals/add-grade" options={{ presentation: "modal", title: "Registrar Nota", headerShown: true }} />
            <Stack.Screen name="modals/grade-task" options={{ presentation: "modal", title: "Calificar Tarea", headerShown: true }} />
            <Stack.Screen name="modals/view-grades" options={{ presentation: "modal", title: "Ver Notas", headerShown: true }} />
            <Stack.Screen name="modals/view-schedule" options={{ presentation: "modal", title: "Detalle de Clase", headerShown: true }} />
            <Stack.Screen name="modals/view-task" options={{ presentation: "modal", title: "Detalle de Tarea", headerShown: true }} />
            
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal", headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}