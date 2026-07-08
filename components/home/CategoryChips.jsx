import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";

function ChipButton({ label, icon, color, isActive, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        className="flex-row items-center px-3.5 py-2 rounded-xl"
        style={
          isActive
            ? { backgroundColor: color }
            : {}
        }
      >
        {icon && (
          <Ionicons
            name={icon}
            size={13}
            color={isActive ? "#FFFFFF" : "#9CA3AF"}
            style={{ marginRight: 5 }}
          />
        )}
        <Text
          className={`font-semibold text-[13px] ${
            isActive ? "" : "text-gray-400 dark:text-gray-500"
          }`}
          style={isActive ? { color: "#FFFFFF" } : {}}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CategoryChips({
  categories = [],
  activeCategory = "all",
  onSelectCategory,
}) {
  if (categories.length === 0) return null;

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}
      >
        <ChipButton
          label="All"
          isActive={activeCategory === "all"}
          color="#FF6B47"
          onPress={() => onSelectCategory("all")}
        />

        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const color = CATEGORY_COLORS[cat] || "#6B7280";
          const icon = CATEGORY_ICONS[cat] || "grid";

          return (
            <ChipButton
              key={cat}
              label={cat}
              icon={icon}
              color={color}
              isActive={isActive}
              onPress={() => onSelectCategory(cat)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
