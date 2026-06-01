import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
} from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import CustomInput from "../../../components/ui/CustomInput";
import { db } from "../../../config/firebase.config";
import useFirestoreUser from "../../../hook/useFireStoreUser";
import { uploadToCloudinary } from "../../../lib/uploadCloudinary";

const INTERESTS = [
 { label:"Music", icon:"musical-notes", color:"#8B5CF6"},
 { label:"Coffee", icon:"cafe", color:"#D97706"},
 { label:"Art", icon:"color-palette", color:"#EC4899"},
 { label:"Books", icon:"book", color:"#6366F1"},
 { label:"Tech", icon:"code-slash", color:"#3B82F6"},
 { label:"Food", icon:"restaurant", color:"#EF4444"},
 { label:"Fashion", icon:"shirt", color:"#F59E0B"},
 { label:"Sports", icon:"football", color:"#10B981"},
 { label:"Local Events", icon:"calendar", color:"#14B8A6"},
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
 const [newImageUri, setNewImageUri] = useState(null);

 useEffect(() => {
 if (user) {
 setUserName(user.userName ||"");
 setBio(user.bio ||"");
 setCurrentLocation(user.currentLocation ||"");
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
 if (status !=="granted") {
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

 const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      shape: "oval",
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let finalImageUrl = user.profilePic;
      if (newImageUri) {
        const uploadedUrl = await uploadToCloudinary(newImageUri);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        userName,
        bio,
        currentLocation,
        locationCoords,
        interests: selectedInterests,
        profilePic: finalImageUrl || null,
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
 <SafeAreaView className="flex-1 bg-bg dark:bg-[#0F0F13]"edges={["top"]}>
 <ScrollView
 contentContainerStyle={{
 flexGrow: 1,
 paddingBottom: 32,
 paddingHorizontal: 20,
 }}
 showsVerticalScrollIndicator={false}
 >
 <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
 <View className="flex-1">
 <View className="w-full flex-row items-center justify-between mt-2 py-3">
 <TouchableOpacity
 onPress={() => router.back()}
 activeOpacity={0.75}
 className="px-3 py-2 rounded-xl bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36]"
 >
 <Text className="font-bold text-primary dark:text-primary-light">Cancel</Text>
 </TouchableOpacity>
 <Text className="font-extrabold text-lg text-secondary dark:text-gray-100">
 Edit Profile
 </Text>
 <TouchableOpacity
 onPress={handleSaveProfile}
 disabled={isSaving}
 activeOpacity={0.75}
 className="min-w-16 px-3 py-2 rounded-xl bg-primary items-center"
 >
 {isSaving ? (
 <ActivityIndicator color="#FFFFFF"size="small"/>
 ) : (
 <Text className="font-bold text-white">Save</Text>
 )}
 </TouchableOpacity>
 </View>

 <View className="w-full mt-8">
 <View className="w-full bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] rounded-2xl p-5 items-center">
 <View className="relative">
 <View className="rounded-full border-4 border-gray-50 dark:border-[#23232E] w-32 h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    source={{
                      uri:
                        newImageUri ||
                        user?.profilePic ||
                        "https://api.dicebear.com/7.x/initials/svg?seed=Felix",
                    }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity 
                  onPress={handlePickImage}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary border-4 border-white dark:border-[#1A1A22] items-center justify-center"
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
 </View>
 <Text className="font-bold text-primary dark:text-primary-light mt-4">
 Edit Picture
 </Text>
 </View>

 <View className="mt-6 bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] rounded-2xl p-4 gap-4">
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
 <Ionicons name="location"size={18} color="#9CA3AF"/>
 }
 />
 <TouchableOpacity
 onPress={handleGetLocation}
 disabled={isLocating}
 className="w-full bg-primary flex-row items-center justify-center rounded-2xl p-3.5 mt-3"
 activeOpacity={0.75}
 >
 {isLocating ? (
 <ActivityIndicator color="#ffffff"size="small"/>
 ) : (
 <>
 <Ionicons name="location"size={18} color="#fff"/>
 <Text className="text-white font-bold ml-2">
 Use Current Location
 </Text>
 </>
 )}
 </TouchableOpacity>
 </View>
 </View>

 <View className="bg-white dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] rounded-2xl p-4 mt-6">
 <View className="w-full flex flex-row items-center justify-between">
 <Text className="text-secondary dark:text-gray-100 text-lg font-extrabold">
 Manage Interests
 </Text>
 <View className="bg-primary-surface dark:bg-primary-surface px-2.5 py-1 rounded-lg">
 <Text className="text-primary dark:text-primary-light text-xs font-bold">
 {selectedInterests.length}
 </Text>
 </View>
 </View>

 <View className="flex flex-row flex-wrap gap-2.5 mt-5">
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
 ?"border-transparent"
 :"bg-white dark:bg-[#1A1A22] border-gray-100 dark:border-[#2A2A36]"
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
 name={isSelected ?"checkmark": item.icon}
 size={16}
 color={isSelected ? item.color :"#9CA3AF"}
 />
 <Text
 className="text-sm font-medium"
 style={{ color: isSelected ? item.color :"#9CA3AF"}}
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
 className="mx-2 mt-8 bg-red-50 dark:bg-red-500/10 py-4 rounded-2xl border border-red-100 dark:border-red-500/20 flex-row items-center justify-center gap-2"
 >
 <Ionicons name="trash"size={18} color="#EF4444"/>
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
