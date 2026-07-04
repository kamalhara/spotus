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
        contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}
      >
        <TouchableOpacity
          onPress={() => onSelectCategory("all")}
          activeOpacity={0.7}
          className="px-3.5 py-2 rounded-xl"
          style={
            activeCategory === "all"
              ? { backgroundColor: "rgba(255, 107, 71, 0.1)" }
              : {}
          }
        >
          <Text
            className={`font-semibold text-[13px] ${
              activeCategory === "all"
                ? "text-primary"
                : "text-gray-400 dark:text-gray-500"
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
              activeOpacity={0.7}
              className="flex-row items-center px-3.5 py-2 rounded-xl"
              style={
                isActive
                  ? { backgroundColor: `${color}12` }
                  : {}
              }
            >
              <Ionicons
                name={icon}
                size={13}
                color={isActive ? color : "#9CA3AF"}
                style={{ marginRight: 5 }}
              />
              <Text
                className={`font-semibold text-[13px] ${
                  isActive ? "" : "text-gray-400 dark:text-gray-500"
                }`}
                style={isActive ? { color } : {}}
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
