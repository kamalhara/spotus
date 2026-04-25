import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import useFirestoreUser from "../hook/useFireStoreUser";

export default function RoomOptionsModal({ showOptions, setShowOptions }) {
  const router = useRouter();
  const { firestoreUser } = useFirestoreUser();

  const selectedRoomId = useLocalSearchParams()?.roomId;

  const OPTIONS = [
    {
      label: "Report",
      onPress: () => {
        console.log("Report");
        setShowOptions(false);
        router.push("/feedback");
      },
      icon: "flag",
      color: "#EF4444",
    },
    {
      label: "Mute",
      onPress: () => {
        console.log("Mute");
        setShowOptions(false);
      },
      icon: "volume-mute",
      color: "#000000",
    },
  ];
  return (
    <Modal
      transparent
      visible={showOptions}
      animationType="fade"
      onRequestClose={() => setShowOptions(false)}
    >
      <Pressable
        className="flex-1 bg-black/30"
        onPress={() => setShowOptions(false)}
      >
        <View className="flex-1 justify-end pb-12 px-5">
          <Pressable>
            <View
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 20,
              }}
            >
              {/* Options */}
              {OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    option.onPress();
                  }}
                  activeOpacity={0.6}
                  className={`flex-row items-center px-5 py-3.5 ${
                    index < OPTIONS.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                    style={{
                      backgroundColor:
                        option.color === "#EF4444" ? "#FEF2F2" : "#F3F4F6",
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={option.color}
                    />
                  </View>
                  <Text
                    className="text-[15px] font-semibold flex-1"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl mt-2 py-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-primary font-bold text-[15px]">Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
