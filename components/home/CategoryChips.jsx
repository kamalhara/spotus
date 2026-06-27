import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants/categories";

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
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        <TouchableOpacity
          onPress={() => onSelectCategory("all")}
          activeOpacity={0.8}
          className={`px-4 py-2 rounded-full border ${
            activeCategory === "all"
              ? "bg-primary border-primary"
              : "bg-white dark:bg-[#1C1C20] border-gray-200 dark:border-[#2C2C30]"
          }`}
        >
          <Text
            className={`font-bold text-[13px] ${
              activeCategory === "all"
                ? "text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const color = CATEGORY_COLORS[cat] || "#6B7280";
          const icon = CATEGORY_ICONS[cat] || "grid";

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.8}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isActive
                  ? "border-transparent"
                  : "bg-white dark:bg-[#1C1C20] border-gray-200 dark:border-[#2C2C30]"
              }`}
              style={isActive ? { backgroundColor: color } : {}}
            >
              <Ionicons
                name={icon}
                size={14}
                color={isActive ? "white" : color}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{ color: isActive ? "white" : color }}
                className={`font-bold text-[13px] ${
                  isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
