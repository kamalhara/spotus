import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";

const LANGUAGES = [
  { code: "en", label: "English", region: "United States" },
  { code: "hi", label: "Hindi", region: "India" },
  { code: "es", label: "Spanish", region: "International" },
  { code: "fr", label: "French", region: "International" },
];

export default function Language() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScreenHeader title="Language" subtitle="App language" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {LANGUAGES.map((language, index) => {
            const selected = selectedLanguage === language.code;
            return (
              <TouchableOpacity
                key={language.code}
                onPress={() => setSelectedLanguage(language.code)}
                activeOpacity={0.75}
                className={`px-5 py-4 flex-row items-center ${
                  index !== LANGUAGES.length - 1
                    ? "border-b border-gray-50"
                    : ""
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center mr-3.5 ${
                    selected ? "bg-primary/10" : "bg-surface-alt"
                  }`}
                >
                  <Ionicons
                    name={selected ? "checkmark" : "language-outline"}
                    size={18}
                    color={selected ? "#4F46E5" : "#94A3B8"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-secondary text-[15px] font-bold">
                    {language.label}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {language.region}
                  </Text>
                </View>
                {selected ? (
                  <View className="bg-primary px-2.5 py-1 rounded-lg">
                    <Text className="text-white text-[10px] font-bold">
                      Active
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
