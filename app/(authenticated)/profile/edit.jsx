import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../../components/ui/CustomInput";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";

const INTERESTS = [
  { label: "Music", icon: "musical-notes", color: "#8B5CF6" },
  { label: "Coffee", icon: "cafe", color: "#D97706" },
  { label: "Art", icon: "color-palette", color: "#EC4899" },
  { label: "Books", icon: "book", color: "#6366F1" },
  { label: "Tech", icon: "code-slash", color: "#3B82F6" },
  { label: "Food", icon: "restaurant", color: "#EF4444" },
  { label: "Fashion", icon: "shirt", color: "#F59E0B" },
  { label: "Sports", icon: "football", color: "#10B981" },
  { label: "Local Events", icon: "calendar", color: "#14B8A6" },
];
export default function Edit() {
  const router = useRouter();
  const { firestoreUser: user } = useFirestoreUser();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.userName || "");
      setBio(user.bio || "");
      setCurrentLocation(user.currentLocation || "");
      if (user.locationCoords) {
        setLocationCoords(user.locationCoords);
      }
      if (user.interests) {
        setSelectedInterests(user.interests);
      }
    }
  }, [user]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLocationCoords(coords);

      let geocode = await Location.reverseGeocodeAsync(coords);
      if (geocode.length > 0) {
        const place = geocode[0];
        const locationName = `${place.city || place.subregion || place.name}, ${
          place.region || place.country
        }`;
        setCurrentLocation(locationName);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Failed to get current location.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        userName,
        bio,
        currentLocation,
        locationCoords,
        interests: selectedInterests,
      });
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile updates.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <SafeAreaView className="h-full bg-bg ">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <View className="w-full flex flex-row items-center justify-between mt-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="font-bold text-primary">Cancel</Text>
              </TouchableOpacity>
              <Text className="font-bold text-lg">Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#4F46E5" size="small" />
                ) : (
                  <Text className="font-bold text-primary">Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="w-full mt-8">
              <View className="w-full flex flex-col items-center gap-4 ">
                <View className=" rounded-full border border-gray-200 w-32 h-32 bg-gray-100">
                  <Image
                    source={{
                      uri:
                        user?.profilePic ||
                        "https://api.dicebear.com/7.x/initials/svg?seed=Felix",
                    }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                </View>
                <Text className="font-bold text-primary">Edit Picture</Text>
              </View>

              <View className="mt-12 flex flex-col gap-4">
                <CustomInput
                  label="Full name"
                  placeholder="Enter full name"
                  value={userName}
                  onChangeText={setUserName}
                  containerStyle={{ paddingVertical: 10 }}
                />

                <CustomInput
                  label="Bio"
                  placeholder="Add a bio"
                  value={bio}
                  onChangeText={setBio}
                  containerStyle={{ paddingVertical: 30 }}
                />
                <View>
                  <CustomInput
                    label="Location"
                    placeholder="Add Location"
                    value={currentLocation}
                    onChangeText={setCurrentLocation}
                    containerStyle={{ paddingVertical: 12 }}
                    icon={
                      <Ionicons name="location" size={18} color="#9CA3AF" />
                    }
                  />
                  <TouchableOpacity
                    onPress={handleGetLocation}
                    disabled={isLocating}
                    className="w-full bg-primary/90 flex flex-row items-center justify-center rounded-lg p-3 mt-3"
                  >
                    {isLocating ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="location" size={18} color="#fff" />
                        <Text className="text-white font-bold ml-2">
                          Use Current Location
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <View className="w-full flex flex-row items-center justify-between mt-10">
                  <Text className="text-secondary text-lg font-bold">
                    Manage Interests
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-primary flex flex-row items-center gap-1 text-sm font-medium">
                      <Ionicons name="add" size={20} color="#3B82F6" />
                      Add more
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row flex-wrap gap-4 mt-5">
                  {INTERESTS.map((item) => {
                    const isSelected = selectedInterests.includes(item.label);
                    return (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedInterests((prev) =>
                            prev.includes(item.label)
                              ? prev.filter((l) => l !== item.label)
                              : [...prev, item.label],
                          )
                        }
                        key={item.label}
                        className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${
                          isSelected
                            ? "border-transparent"
                            : "bg-white border-gray-100"
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: `${item.color}15`,
                                borderColor: `${item.color}30`,
                              }
                            : {}
                        }
                      >
                        <Ionicons
                          name={isSelected ? "checkmark" : item.icon}
                          size={16}
                          color={isSelected ? item.color : "#9CA3AF"}
                        />
                        <Text
                          className="text-sm font-medium"
                          style={{ color: isSelected ? item.color : "#9CA3AF" }}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="mx-6 mt-24 bg-red-50 py-4 rounded-2xl border border-red-100 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
              <Text className="text-red-500 font-semibold text-[15px]">
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}
