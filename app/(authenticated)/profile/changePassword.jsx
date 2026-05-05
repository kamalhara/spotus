import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../../components/ui/CustomInput";
import useFirestoreUser from "../../../hook/useFireStoreUser";

export default function ChangePassword() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { firestoreUser: user } = useFirestoreUser();

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="arrow-back" size={20} color="#4F46E5" />
                </TouchableOpacity>
                <Text className="text-secondary font-extrabold text-xl">
                  Change Password
                </Text>
              </View>

              {/* Progress/Step Indicator */}
              <View className="flex-row gap-2 mt-8 mb-8">
                <View className="h-1.5 rounded-full bg-primary w-10" />
                <View className="h-1.5 rounded-full bg-gray-200 w-6" />
              </View>

              <View className="flex flex-col gap-4">
                <CustomInput
                  label="Current Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                  }
                />

                <CustomInput
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon={
                    <Ionicons name="shield-outline" size={20} color="#9CA3AF" />
                  }
                />

                <CustomInput
                  label="Confirm New Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                  }
                />

                <TouchableOpacity
                  className="bg-primary py-4 rounded-2xl mt-4 items-center shadow-md shadow-primary/20"
                  activeOpacity={0.8}
                  onPress={() => {
                    // Logic to update password will go here
                  }}
                >
                  <Text className="text-white font-bold text-lg">
                    Update Password
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-gray-400 text-xs text-center mt-8 px-4">
                Your password must be at least 8 characters long and include a
                mix of letters and numbers.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
