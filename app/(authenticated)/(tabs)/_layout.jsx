import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
} from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabsLayout() {
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
        name="rooms"
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
        name="chat"
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
      <NativeTabs.Trigger name="rooms">
        <Label>Rooms</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{ default: "person.2", selected: "person.2.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <Label>Chat</Label>
        <Icon
          selectedColor="#4F46E5"
          sf={{ default: "message", selected: "message.fill" }}
        />
        <Badge>3</Badge>
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
