import { Alert } from "react-native";
import { trackEvent } from "./analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const showExploreIntercept = (actionName, onEnableLocation) => {
  trackEvent(`Tried to ${actionName} while exploring`);
  
  Alert.alert(
    "Enable Location to Participate",
    "SpotUs requires location sharing to create and join conversations. This helps keep the community authentic and prevents anonymous abuse.",
    [
      { 
        text: "Keep Exploring", 
        style: "cancel" 
      },
      { 
        text: "Enable Location", 
        onPress: async () => {
          await AsyncStorage.setItem("isGhostBrowsing", "false");
          if (onEnableLocation) onEnableLocation();
        } 
      }
    ]
  );
};
