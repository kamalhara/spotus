import { ScrollView, Text, View } from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import ScreenHeader from"../../../components/ui/ScreenHeader";

const SECTIONS = [
 {
 title:"Community behavior",
 body:"Use rooms for constructive, respectful conversations. Avoid spam, harassment, and misleading activity.",
 },
 {
 title:"Messaging access",
 body:"Direct messaging access depends on trust built inside shared rooms.",
 },
 {
 title:"Account responsibility",
 body:"Keep your account information accurate and use the available safety tools when needed.",
 },
];

export default function Terms() {
 return (
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#111113]"edges={["top"]}>
 <ScreenHeader title="Terms of Service"subtitle="App terms"/>

 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
 >
 {SECTIONS.map((section) => (
 <View
 key={section.title}
 className="bg-white dark:bg-[#1C1C20] rounded-2xl border border-gray-100 dark:border-[#2C2C30] p-5 mb-3"
 >
 <Text className="text-secondary dark:text-gray-100 text-base font-display font-extrabold">
 {section.title}
 </Text>
 <Text className="text-gray-400 dark:text-gray-500 text-sm leading-6 mt-2">
 {section.body}
 </Text>
 </View>
 ))}
 </ScrollView>
 </SafeAreaView>
 );
}
