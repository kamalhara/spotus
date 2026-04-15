import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import useUnreadCount from "../../../hook/useUnreadCount";

export default function TabsLayout() {
  const { firestoreUser } = useFirestoreUser();
  const unreadCount = useUnreadCount(firestoreUser?.id);
  return Platform.OS === "android" ? (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5", // primary color
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FAFAFA",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          paddingTop: 5,
          height: 80,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms_tab"
        options={{
          title: "Rooms",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat_tab"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  ) : (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{ default: "house", selected: "house.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rooms_tab">
        <Label>Rooms</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{ default: "person.2", selected: "person.2.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat_tab">
        <Label>Chat</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{ default: "message", selected: "message.fill" }}
        />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
