import { useSignIn } from"@clerk/expo";
import { Ionicons } from"@expo/vector-icons";
import { useLocalSearchParams, useRouter } from"expo-router";
import { useEffect, useRef, useState } from"react";
import {
 ActivityIndicator,
 Animated,
 Keyboard,
 KeyboardAvoidingView,
 LayoutAnimation,
 Platform,
 Text,
 TouchableOpacity,
 TouchableWithoutFeedback,
 UIManager,
 View,
} from"react-native";
import { SafeAreaView } from"react-native-safe-area-context";
import CustomButton from"../../components/ui/CustomButton";
import CustomInput from"../../components/ui/CustomInput";
import { useTheme } from"../../context/ThemeContext";

// Enable LayoutAnimation on Android
if (
 Platform.OS ==="android"&&
 UIManager.setLayoutAnimationEnabledExperimental
) {
 UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RESEND_COOLDOWN = 30; // seconds

function getClerkErrorMessage(err) {
 return (
 err?.errors?.[0]?.longMessage ||
 err?.errors?.[0]?.message ||
"Something went wrong. Please try again."
 );
}

function isValidEmail(email) {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getPasswordStrength(password) {
 if (!password) return { level: 0, label:"", color:"#E2E8F0"};

 let score = 0;
 if (password.length >= 6) score++;
 if (password.length >= 10) score++;
 if (/[A-Z]/.test(password)) score++;
 if (/[0-9]/.test(password)) score++;
 if (/[^A-Za-z0-9]/.test(password)) score++;

 if (score <= 1) return { level: 1, label:"Weak", color:"#EF4444"};
 if (score <= 2) return { level: 2, label:"Fair", color:"#F59E0B"};
 if (score <= 3) return { level: 3, label:"Good", color:"#3B82F6"};
 return { level: 4, label:"Strong", color:"#10B981"};
}

export default function ForgotPassword() {
 const router = useRouter();
 const params = useLocalSearchParams();
 const { isLoaded, signIn, setActive } = useSignIn();
 const { isDark } = useTheme();

 const [emailAddress, setEmailAddress] = useState("");
 const [code, setCode] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [codeSent, setCodeSent] = useState(false);
 const [sendingCode, setSendingCode] = useState(false);
 const [resettingPassword, setResettingPassword] = useState(false);
 const [error, setError] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const [resendCooldown, setResendCooldown] = useState(0);

 const codeInputRef = useRef(null);
 const fadeIn = useRef(new Animated.Value(0)).current;
 const slideUp = useRef(new Animated.Value(20)).current;
 const successFade = useRef(new Animated.Value(0)).current;

 // Entrance animation
 useEffect(() => {
 Animated.parallel([
 Animated.timing(fadeIn, {
 toValue: 1,
 duration: 500,
 useNativeDriver: true,
 }),
 Animated.timing(slideUp, {
 toValue: 0,
 duration: 500,
 useNativeDriver: true,
 }),
 ]).start();
 }, [fadeIn, slideUp]);

 // Pre-fill email from params
 useEffect(() => {
 if (typeof params.email ==="string"&& params.email.length > 0) {
 setEmailAddress(params.email);
 }
 }, [params.email]);

 // Resend cooldown timer
 useEffect(() => {
 if (resendCooldown <= 0) return;
 const timer = setInterval(() => {
 setResendCooldown((prev) => {
 if (prev <= 1) {
 clearInterval(timer);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);
 return () => clearInterval(timer);
 }, [resendCooldown]);

 // Animate success message
 useEffect(() => {
 if (successMessage) {
 Animated.timing(successFade, {
 toValue: 1,
 duration: 300,
 useNativeDriver: true,
 }).start();
 const timeout = setTimeout(() => {
 Animated.timing(successFade, {
 toValue: 0,
 duration: 300,
 useNativeDriver: true,
 }).start(() => setSuccessMessage(""));
 }, 4000);
 return () => clearTimeout(timeout);
 }
 }, [successMessage, successFade]);

 const passwordStrength = getPasswordStrength(newPassword);
 const canSendCode = isValidEmail(emailAddress) && !sendingCode;
 const canResetPassword =
 code.trim().length >= 4 &&
 newPassword.length >= 6 &&
 confirmPassword.length >= 6 &&
 !resettingPassword;

 const handleSendCode = async () => {
 if (!isLoaded || !signIn) return;

 setSendingCode(true);
 setError("");
 setSuccessMessage("");

 try {
 await signIn.create({
 strategy:"reset_password_email_code",
 identifier: emailAddress.trim(),
 });

 LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
 setCodeSent(true);
 setResendCooldown(RESEND_COOLDOWN);
 setSuccessMessage(`Verification code sent to ${emailAddress.trim()}`);

 // Auto-focus code input after a brief delay
 setTimeout(() => codeInputRef.current?.focus?.(), 400);
 } catch (err) {
 setError(getClerkErrorMessage(err));
 } finally {
 setSendingCode(false);
 }
 };

 const handleResendCode = async () => {
 if (!isLoaded || !signIn || resendCooldown > 0 || sendingCode) return;

 setSendingCode(true);
 setError("");
 setSuccessMessage("");

 try {
 await signIn.create({
 strategy:"reset_password_email_code",
 identifier: emailAddress.trim(),
 });
 setResendCooldown(RESEND_COOLDOWN);
 setSuccessMessage("A new verification code has been sent.");
 } catch (err) {
 setError(getClerkErrorMessage(err));
 } finally {
 setSendingCode(false);
 }
 };

 const handleResetPassword = async () => {
 if (!isLoaded || !signIn) return;

 if (newPassword !== confirmPassword) {
 setError("Passwords do not match.");
 return;
 }

 if (newPassword.length < 6) {
 setError("Password must be at least 6 characters.");
 return;
 }

 setResettingPassword(true);
 setError("");

 try {
 const result = await signIn.attemptFirstFactor({
 strategy:"reset_password_email_code",
 code: code.trim(),
 password: newPassword,
 });

 if (result.status ==="complete"&& result.createdSessionId) {
 await setActive({ session: result.createdSessionId });
 router.replace("/");
 return;
 }

 if (result.status ==="needs_second_factor") {
 setError(
"Password updated. Additional verification is required to finish signing in.",
 );
 return;
 }

 setError("Password reset could not be completed.");
 } catch (err) {
 setError(getClerkErrorMessage(err));
 } finally {
 setResettingPassword(false);
 }
 };

 const handleUseDifferentEmail = async () => {
 LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
 setCodeSent(false);
 setCode("");
 setNewPassword("");
 setConfirmPassword("");
 setError("");
 setSuccessMessage("");
 setResendCooldown(0);
 await signIn?.reset?.();
 };

 const passwordsMatch =
 confirmPassword.length > 0 && newPassword === confirmPassword;
 const passwordsMismatch =
 confirmPassword.length > 0 && newPassword !== confirmPassword;

 return (
 <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
 <SafeAreaView className="bg-bg dark:bg-[#0F0F13] flex-1">
 <KeyboardAvoidingView
 behavior={Platform.OS ==="ios"?"padding":"height"}
 className="flex-1 px-8"
 >
 {/* Header */}
 <View className="flex-row items-center mt-4">
 <TouchableOpacity
 onPress={() => router.back()}
 className="w-10 h-10 bg-gray-50 dark:bg-[#1A1A22] rounded-full items-center justify-center border border-gray-100 dark:border-[#2A2A36]"
 >
 <Ionicons name="arrow-back"size={20} color={isDark ?"white":"black"} />
 </TouchableOpacity>

 {/* Step indicator */}
 <View className="flex-row items-center ml-auto gap-2">
 <View
 className={`h-1 rounded-full ${codeSent ?"w-4 bg-primary/30":"w-8 bg-primary"}`}
 />
 <View
 className={`h-1 rounded-full ${codeSent ?"w-8 bg-primary":"w-4 bg-gray-200"}`}
 />
 </View>
 </View>

 <Animated.View
 style={{
 opacity: fadeIn,
 transform: [{ translateY: slideUp }],
 flex: 1,
 }}
 >
 {/* Title Section */}
 <View className="mt-8 mb-8">
 <Text className="text-secondary dark:text-gray-100 text-[32px] font-bold tracking-tight mb-1">
 {codeSent ?"Reset\nPassword":"Forgot\nPassword"}
 </Text>
 <View className="mt-3 mb-3 w-12 h-1 rounded-full bg-primary"/>
 <Text className="text-gray-400 dark:text-gray-500 text-base leading-6">
 {codeSent
 ?"Enter the code and choose a new password."
 :"Enter your email to receive a reset code."}
 </Text>
 </View>

 {/* Success Message */}
 {successMessage ? (
 <Animated.View
 style={{ opacity: successFade }}
 className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex-row items-center mb-5"
 >
 <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-2.5">
 <Ionicons
 name="checkmark-circle"
 size={12}
 color="#10B981"
 />
 </View>
 <Text className="text-emerald-600 text-sm flex-1 leading-5">
 {successMessage}
 </Text>
 </Animated.View>
 ) : null}

 {/* Form Fields */}
 <View className="mb-8 flex flex-col gap-5">
 {!codeSent ? (
 <CustomInput
 label="Email Address"
 placeholder="example@gmail.com"
 value={emailAddress}
 onChangeText={(text) => {
 setEmailAddress(text);
 if (error) setError("");
 }}
 autoCapitalize="none"
 keyboardType="email-address"
 autoComplete="email"
 returnKeyType="send"
 onSubmitEditing={canSendCode ? handleSendCode : undefined}
 icon={
 <Ionicons name="mail-outline"size={20} color="#9CA3AF"/>
 }
 error={
 emailAddress.length > 0 && !isValidEmail(emailAddress)
 ?"Enter a valid email address"
 : undefined
 }
 />
 ) : (
 <>
 {/* Locked email display */}
 <View className="bg-gray-50 dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A36] rounded-2xl px-4 py-3 flex-row items-center">
 <View className="w-6 items-center mr-3">
 <Ionicons
 name="mail-outline"
 size={18}
 color="#9CA3AF"
 />
 </View>
 <View className="flex-1">
 <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-[1.5px]">
 Email
 </Text>
 <Text className="text-secondary dark:text-gray-100 text-base font-semibold mt-0.5">
 {emailAddress}
 </Text>
 </View>
 <TouchableOpacity
 onPress={handleUseDifferentEmail}
 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
 >
 <Ionicons name="pencil"size={16} color="#4F46E5"/>
 </TouchableOpacity>
 </View>

 <CustomInput
 ref={codeInputRef}
 label="Reset Code"
 placeholder="123456"
 value={code}
 onChangeText={(text) => {
 setCode(text);
 if (error) setError("");
 }}
 keyboardType="number-pad"
 maxLength={6}
 icon={
 <Ionicons
 name="keypad-outline"
 size={20}
 color="#9CA3AF"
 />
 }
 />

 <CustomInput
 label="New Password"
 placeholder="At least 6 characters"
 value={newPassword}
 onChangeText={(text) => {
 setNewPassword(text);
 if (error) setError("");
 }}
 secureTextEntry
 icon={
 <Ionicons
 name="lock-closed-outline"
 size={20}
 color="#9CA3AF"
 />
 }
 />

 {/* Password strength indicator */}
 {newPassword.length > 0 && (
 <View className="-mt-2 px-1">
 <View className="flex-row gap-1.5 mb-1.5">
 {[1, 2, 3, 4].map((level) => (
 <View
 key={level}
 className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100"
 >
 <View
 style={{
 width:
 passwordStrength.level >= level
 ?"100%"
 :"0%",
 backgroundColor: passwordStrength.color,
 height:"100%",
 borderRadius: 999,
 }}
 />
 </View>
 ))}
 </View>
 <Text
 style={{ color: passwordStrength.color }}
 className="text-[11px] font-semibold tracking-wide"
 >
 {passwordStrength.label}
 </Text>
 </View>
 )}

 <CustomInput
 label="Confirm Password"
 placeholder="Repeat your new password"
 value={confirmPassword}
 onChangeText={(text) => {
 setConfirmPassword(text);
 if (error) setError("");
 }}
 secureTextEntry
 returnKeyType="done"
 onSubmitEditing={
 canResetPassword ? handleResetPassword : undefined
 }
 icon={
 passwordsMatch ? (
 <Ionicons
 name="shield-checkmark"
 size={20}
 color="#10B981"
 />
 ) : (
 <Ionicons
 name="shield-checkmark-outline"
 size={20}
 color="#9CA3AF"
 />
 )
 }
 error={
 passwordsMismatch ?"Passwords do not match": undefined
 }
 />
 </>
 )}

 {/* Error Message */}
 {error ? (
 <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex-row items-start">
 <View className="w-5 h-5 bg-red-100 rounded-full items-center justify-center mr-2.5 mt-0.5">
 <Ionicons name="alert-circle"size={12} color="#EF4444"/>
 </View>
 <Text className="text-red-500 text-sm flex-1 leading-5">
 {error}
 </Text>
 </View>
 ) : null}
 </View>

 {/* Action Buttons */}
 {codeSent ? (
 <View className="gap-4">
 <CustomButton
 title="Update Password"
 onPress={handleResetPassword}
 loading={resettingPassword}
 disabled={!canResetPassword}
 />
 <TouchableOpacity
 onPress={handleResendCode}
 disabled={resendCooldown > 0 || sendingCode}
 className="py-3 items-center"
 >
 {sendingCode ? (
 <ActivityIndicator size="small"color="#4F46E5"/>
 ) : (
 <Text
 className={`text-sm font-medium ${resendCooldown > 0 ?"text-gray-300":"text-primary"}`}
 >
 {resendCooldown > 0
 ? `Resend code in ${resendCooldown}s`
 :"Resend Code"}
 </Text>
 )}
 </TouchableOpacity>
 </View>
 ) : (
 <CustomButton
 title="Send Reset Code"
 onPress={handleSendCode}
 loading={sendingCode}
 disabled={!canSendCode}
 />
 )}

 {/* Back to Login */}
 <TouchableOpacity
 onPress={() => router.push("/(auth)/login")}
 className="py-3 mt-5"
 >
 <View className="flex-row justify-center items-center gap-1.5">
 <Ionicons name="arrow-back"size={14} color="#9CA3AF"/>
 <Text className="text-gray-400 dark:text-gray-500 text-[15px]">
 Back to login
 </Text>
 </View>
 </TouchableOpacity>
 </Animated.View>
 </KeyboardAvoidingView>
 </SafeAreaView>
 </TouchableWithoutFeedback>
 );
}
