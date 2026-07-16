import { useAuth } from "@/src/lib/auth-context";
import { isProfesor } from "@/src/lib/role-utils";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

export default function Layout() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.light.headerBackground,
      },
      headerTintColor: Colors.light.headerText,
      headerTitleStyle: {
        fontWeight: "bold",
      },
      tabBarActiveTintColor: Colors.light.tabIconSelected,
      tabBarInactiveTintColor: Colors.light.tabIconDefault,
      tabBarStyle: {
        backgroundColor: Colors.light.tabBarBackground,
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
      },
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="horarios" 
        options={{ 
          title: "Horarios",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="tareas" 
        options={{ 
          title: "Tareas",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="notas" 
        options={{ 
          title: "Notas",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          href: isProfesor(profile?.rol) ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="catalogo"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          href: isProfesor(profile?.rol) ? null : undefined,
        }}
      />
    </Tabs>
  );
}