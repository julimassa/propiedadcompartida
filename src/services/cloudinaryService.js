import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

export async function uploadImageToCloudinary(imageUri) {
  const CLOUD_NAME = "dnroaqyiz";      // 👈 este nombre EXACTO
  const UPLOAD_PRESET = "expo_unsigned";

  const formData = new FormData();

  formData.append("file", new File(imageUri));

  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.log("Cloudinary error:", result);
    throw new Error(result?.error?.message || "Error subiendo imagen");
  }

  if (typeof result?.secure_url !== "string" || !result.secure_url.trim()) {
    throw new Error("Cloudinary no devolvió una URL válida para la imagen.");
  }

  return result.secure_url;
}
