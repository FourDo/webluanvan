import axios from "axios";

// Service upload hình ảnh lên Cloudinary
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("File phải là hình ảnh");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("Kích thước file không được vượt quá 10MB");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "webluanvan_upload");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dubtdbe8z/image/upload",
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message || "Upload failed";
      throw new Error(errorMessage);
    }
    throw new Error("Có lỗi xảy ra khi upload hình ảnh");
  }
};

// Convert base64 to File object
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
