import * as SecureStore from"expo-secure-store";
import { Platform } from"react-native";

const createTokenCache = () => {
 return {
 getToken: async (key) => {
 try {
 const item = await SecureStore.getItemAsync(key);
 return item;
 } catch (error) {
 console.error("SecureStore get item error:", error);
 await SecureStore.deleteItemAsync(key);
 return null;
 }
 },
 saveToken: (key, value) => {
 try {
 return SecureStore.setItemAsync(key, value);
 } catch (err) {
 console.error("SecureStore set item error:", err);
 return;
 }
 },
 };
};

// SecureStore is not supported on the web
export const tokenCache =
 Platform.OS !=="web"? createTokenCache() : undefined;
