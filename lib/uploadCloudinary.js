import { apiRequest } from "./api";

export const uploadToCloudinary = async (uri, token) => {
 const signature = await apiRequest("/api/uploads/image-signature", {
   method: "POST",
   token,
 });
 const data = new FormData();

 data.append("file", {
 uri,
 type:"image/jpeg",
 name:"upload.jpg",
 });

 data.append("api_key", signature.apiKey);
 data.append("timestamp", String(signature.timestamp));
 data.append("signature", signature.signature);
 data.append("folder", signature.folder);

 try {
 const res = await fetch(
`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
 {
 method:"POST",
 body: data,
 },
 );

 const result = await res.json();
 if (!res.ok || !result.secure_url || !result.public_id) {
   throw new Error(result?.error?.message || "Image upload failed");
 }
 return {
   imageUrl: result.secure_url,
   cloudinaryPublicId: result.public_id,
 };
 } catch (err) {
 console.error("Cloudinary upload failed:", err);
 throw err;
 }
};
