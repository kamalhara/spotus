import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatMessages from "../../components/ChatMessages";

export default function RoomChat() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse room data if passed as a string, otherwise use placeholder
  let room = {
    title: "IPL Discussion",
    category: "Sports",
    participants: new Array(12),
  };
  if (params.room) {
    try {
      room = JSON.parse(params.room);
    } catch (e) {
      console.error("Failed to parse room param", e);
    }
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "John Doe",
      message: "Hello, how are you?",
      time: "10:00 AM",
      sentByMe: false,
    },
    {
      id: 2,
      user: "Jane Doe",
      message: "I'm fine, thank you!",
      time: "10:01 AM",
      sentByMe: true,
    },
    {
      id: 3,
      user: "John Doe",
      message: "Hello, how are you?",
      time: "10:00 AM",
      sentByMe: false,
    },
    {
      id: 4,
      user: "Jane Doe",
      message: "I'm fine, thank you!",
      time: "10:01 AM",
      sentByMe: true,
    },
  ]);

  return (
    <View className="flex-1 bg-[#F9FAFB] ">
      {/* Premium Header */}
      <View className="bg-white shadow-sm shadow-slate-200 z-10">
        <SafeAreaView edges={["top"]}>
          <View className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-50">
            <View className="flex flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4 border border-gray-100 active:bg-gray-100"
              >
                <Ionicons name="chevron-back" size={20} color="#1F2937" />
              </TouchableOpacity>

              <View className="flex-1">
                <Text
                  className="text-secondary text-xl font-black tracking-tight leading-7"
                  numberOfLines={1}
                >
                  {room.title}
                </Text>
                <View className="flex flex-row items-center mt-0.5">
                  <View className="bg-green-500 w-2 h-2 rounded-full mr-2 shadow-sm shadow-green-200" />
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {room.category} • {room.participants?.length || 0} ACTIVE
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-100">
              <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Medium Trust Meter Card */}
      <View className="px-6 mt-4">
        <View className="bg-white px-4 py-3.5 rounded-2xl border border-gray-100 shadow-sm shadow-slate-50">
          <View className="flex flex-row items-center justify-between mb-3">
            <View className="flex flex-row items-center gap-2">
              <Ionicons name="shield-checkmark" size={16} color="#4F46E5" />
              <Text className="text-secondary text-[11px] font-bold uppercase tracking-wider">
                Trust Meter
              </Text>
            </View>
            <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
              <Text className="text-primary text-[11px] font-black">50%</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-3">
            <View className="flex-1">
              <Progress.Bar
                progress={0.5}
                width={null}
                color="#4F46E5"
                unfilledColor="#F3F4F6"
                borderWidth={0}
                height={7}
                borderRadius={4}
                animated={true}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2.5 ml-0.5">
            7 more messages to unlock direct messaging
          </Text>
        </View>
      </View>

      <ChatMessages messages={messages} />
    </View>
  );
}
