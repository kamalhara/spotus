import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

function BlockedUserModal({ showBlockedModal, setShowBlockedModal }) {
  return (
    <Modal visible={showBlockedModal} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white dark:bg-[#1A1A22] w-11/12 rounded-2xl p-5 shadow-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-secondary dark:text-gray-100 text-xl font-bold">
              Blocked Users
            </Text>
            <TouchableOpacity onPress={() => setShowBlockedModal(false)}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          {/* Mock list */}
          <View className="mb-4">
            {[1, 2, 3].map((_, idx) => (
              <View
                key={idx}
                className="flex-row items-center p-3 border-b border-gray-100 dark:border-[#2A2A36] last:border-0"
              >
                <View className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-secondary dark:text-gray-100 text-base font-semibold">
                    User Name {idx + 1}
                  </Text>
                </View>
                <View className="flex-row items-center bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-1.5 rounded-xl">
                  <Ionicons name="ban" size={14} color="#EF4444" />
                  <Text className="text-red-500 text-xs font-semibold ml-1.5">
                    Unblock
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BlockedUserModal;
