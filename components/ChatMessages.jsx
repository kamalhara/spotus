import { FlatList, Text, View } from "react-native";

export default function ChatMessages({ messages }) {
  // Generate a consistent color based on username for avatar
  const getUserColor = (username) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderMessage = ({ item, index }) => {
    const isSentByMe = item.sentByMe === true;

    // Group messages by user if consecutive
    const showAvatarAndName = !isSentByMe && (index === 0 || messages[index - 1].user !== item.user);
    const addTopMargin = index === 0 || messages[index - 1].user !== item.user;

    return (
      <View className={`w-full flex-row ${isSentByMe ? "justify-end" : "justify-start"} ${addTopMargin ? "mt-4" : "mt-1.5"} px-2`}>
        {!isSentByMe && (
          <View className="w-8 mr-2 flex justify-end pb-4">
             {showAvatarAndName ? (
               <View className={`w-8 h-8 rounded-full items-center justify-center ${getUserColor(item.user)} shadow-sm`}>
                 <Text className="text-white text-[13px] font-black">{item.user.charAt(0).toUpperCase()}</Text>
               </View>
             ) : (
               <View className="w-8 h-8" />
             )}
          </View>
        )}

        <View className={`max-w-[77%] flex-col ${isSentByMe ? "items-end" : "items-start"}`}>
          {showAvatarAndName && (
            <Text className="text-gray-500 text-[11px] font-bold tracking-wide mb-1.5 ml-1 opacity-90 uppercase">
              {item.user}
            </Text>
          )}

          <View
            className={`px-4 py-3 shadow-sm ${
              isSentByMe
                ? "bg-primary rounded-2xl rounded-tr-sm shadow-indigo-100"
                : "bg-white border border-gray-100/80 rounded-2xl rounded-tl-sm shadow-slate-100"
            }`}
          >
            <Text className={`text-[15px] leading-5 ${isSentByMe ? "text-white" : "text-gray-800"}`}>
              {item.message}
            </Text>
          </View>

          <Text className={`text-gray-400 text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isSentByMe ? "mr-1" : "ml-1"}`}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={renderMessage}
      contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
