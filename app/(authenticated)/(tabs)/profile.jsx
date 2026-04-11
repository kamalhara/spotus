import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import useFirestoreUser from "../../../hook/useFireStoreUser";

const MenuItem = ({ icon, label, onPress, color = "#4F46E5", isLast = false }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    activeOpacity={0.6}
    className={`bg-white px-5 py-4 flex-row items-center justify-between ${!isLast ? 'border-b border-gray-50' : ''}`}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-secondary font-bold text-[15px]">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text className="text-gray-400 font-bold text-[11px] uppercase tracking-[1.5px] px-6 mt-2 mb-2">
    {title}
  </Text>
);

export default function Profile() {
  const { signOut } = useAuth();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!firestoreUser) {
    return <Redirect href="/welcome" />;
  }

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="bg-bg flex-1" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View className="items-center px-6 mt-8 mb-6">
          <View className="relative">
            <View className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl shadow-slate-200 overflow-hidden bg-gray-100">
              <Image
                source={firestoreUser?.profilePic || "https://picsum.photos/200"}
                contentFit="cover"
                transition={500}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-2xl border-4 border-bg items-center justify-center"
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-secondary text-3xl font-black mt-5 tracking-tight">
            {firestoreUser?.userName || "User"}
          </Text>
          <Text className="text-gray-400 text-base font-semibold">
            {firestoreUser?.email}
          </Text>
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-slate-100 flex-row items-center justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-primary">
                {firestoreUser?.roomsCreated ?? 0}
              </Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Created</Text>
            </View>
            <View className="w-[1px] bg-gray-50 h-8" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-secondary">
                {firestoreUser?.roomsJoined ?? 0}
              </Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Joined</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="bg-white mx-6 rounded-3xl border border-gray-100 overflow-hidden shadow-sm shadow-slate-50">
          <SectionHeader title="General" />
          <MenuItem icon="person-outline" label="Account Settings" />
          <MenuItem icon="create-outline" label="Edit Profile" />
          <MenuItem icon="shield-checkmark-outline" label="Security" isLast />
        </View>

        <View className="bg-white mx-6 mt-6 rounded-3xl border border-gray-100 overflow-hidden shadow-sm shadow-slate-50">
          <SectionHeader title="App Settings" />
          <MenuItem icon="notifications-outline" label="Notifications" color="#6366F1" />
          <MenuItem icon="eye-outline" label="Privacy & Data" color="#6366F1" />
          <MenuItem icon="language-outline" label="Language" color="#6366F1" isLast />
        </View>

        <View className="bg-white mx-6 mt-6 rounded-3xl border border-gray-100 overflow-hidden shadow-sm shadow-slate-50">
          <SectionHeader title="Support & Legal" />
          <MenuItem icon="help-circle-outline" label="Help Center" color="#94A3B8" />
          <MenuItem icon="information-circle-outline" label="About SpotUs" color="#94A3B8" isLast />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="mx-6 mt-8 bg-red-50 py-5 rounded-[28px] border border-red-100 flex-row items-center justify-center gap-2"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base tracking-wide">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-[10px] font-bold mt-8 uppercase tracking-[2px]">
          SpotUs v1.0.4
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
