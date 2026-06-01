export const uploadToCloudinary = async (uri) => {
 const data = new FormData();

 data.append("file", {
 uri,
 type:"image/jpeg",
 name:"upload.jpg",
 });

 data.append("upload_preset","chat_images");
 data.append("cloud_name","dbdu7vybl");

 try {
 const res = await fetch(
"https://api.cloudinary.com/v1_1/dbdu7vybl/image/upload",
 {
 method:"POST",
 body: data,
 },
 );

 const result = await res.json();
 return result.secure_url;
 } catch (err) {
 console.log("Upload error:", err);
 return null;
 }
};
