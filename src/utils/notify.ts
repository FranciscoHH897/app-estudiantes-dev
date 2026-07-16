import { Alert, Platform } from "react-native";

/**
 * react-native-web no implementa Alert.alert (es un no-op), por lo que en web
 * hay que usar window.alert para que el mensaje realmente se muestre.
 */
export const notify = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
