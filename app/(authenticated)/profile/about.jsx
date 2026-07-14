import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SettingsRow from "../../../components/ui/SettingsRow";
import SettingsSection from "../../../components/ui/SettingsSection";

export default function About() {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]" edges={["top"]}>
      <ScreenHeader title="About SpotUs" subtitle="Version and details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <View className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-6 items-center mb-4">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Image
              source={require("../../../assets/images/icon-dark.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-secondary dark:text-gray-100 text-2xl font-display font-extrabold tracking-tight">
              Spot Us
            </Text>
          </View>
          <Text className="text-gray-400 dark:text-gray-500 text-sm leading-5 text-center mt-3">
            Rooms and direct messages for people nearby.
          </Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4">
            <Text className="text-primary dark:text-primary-light text-xl font-display font-extrabold">
              1.0.0
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Version
            </Text>
          </View>
          <View className="flex-1 bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-4">
            <Text className="text-secondary dark:text-gray-100 text-xl font-display font-extrabold">
              Expo
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Built with
            </Text>
          </View>
        </View>

        <SettingsSection title="Product">
          <SettingsRow
            icon="people-outline"
            title="Rooms first"
            description="Meet through shared interest spaces before direct messages."
          />
          <SettingsRow
            icon="chatbubbles-outline"
            title="Request based"
            description="Direct conversations begin with an accepted message request."
          />
          <SettingsRow
            icon="location-outline"
            title="Nearby by design"
            description="Rooms are organized around location and recent activity."
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
