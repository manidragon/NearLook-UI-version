import imageCompression from 'browser-image-compression';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  file?: File;
}

export type ImageType = 'product' | 'logo' | 'banner' | 'general';

export const uploadToCloudinary = async (
  file: File,
  imageType: ImageType = 'general',
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // ✅ Validate file type and extension
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExts = /\.(jpg|jpeg|png|webp)$/i;

    if (!allowedTypes.includes(file.type) || !allowedExts.test(file.name)) {
      return {
        success: false,
        error: 'Only JPEG, JPG, PNG, or WebP images are allowed',
        file
      };
    }

    // ✅ Validate file size (max 3MB)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 3MB',
        file
      };
    }

    // ✅ Compress Image Based on Type
    let maxWidthOrHeight = 800;
    let maxSizeMB = 0.2; // 200KB

    if (imageType === 'product') {
      maxWidthOrHeight = 1200;
      maxSizeMB = 0.3;
    } else if (imageType === 'banner') {
      maxWidthOrHeight = 1200;
      maxSizeMB = 0.4;
    } else if (imageType === 'logo') {
      maxWidthOrHeight = 250;
      maxSizeMB = 0.05; // 50KB
    }

    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      onProgress: onProgress ? (progress: number) => onProgress(progress / 2) : undefined 
      // Divide progress by 2 because compression takes time before upload
    };

    let fileToUpload = file;
    try {
      fileToUpload = await imageCompression(file, options);
    } catch (compressErr) {
      console.warn("Image compression failed, falling back to original file", compressErr);
    }

    const cloud_name = "dt6nu9oqs";
    const upload_preset = "nearlook";
    const url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    const data = new FormData();
    data.append("file", fileToUpload);
    data.append("upload_preset", upload_preset);
    data.append("cloud_name", cloud_name);
    // ✅ Optional: Add folder for organization
    data.append("folder", "nearlook_uploads");

    const res = await fetch(url, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${res.status}`);
    }

    const fileData: CloudinaryUploadResponse = await res.json();

    console.log("✅ Image uploaded:", {
      url: fileData.secure_url,
      public_id: fileData.public_id,
      format: fileData.format
    });

    return {
      success: true,
      url: fileData.secure_url,
      file: fileToUpload
    };

  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", {
      fileName: file.name,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message || 'Failed to upload image',
      file
    };
  }
};

// ✅ Helper: Upload multiple files with concurrency limit
export const uploadMultipleToCloudinary = async (
  files: File[],
  imageType: ImageType = 'general',
  onFileProgress?: (fileName: string, progress: number) => void
): Promise<{ successful: string[]; failed: { fileName: string; error: string }[] }> => {

  const results = await Promise.allSettled(
    files.map(file =>
      uploadToCloudinary(file, imageType, (progress) => {
        if (onFileProgress) {
          onFileProgress(file.name, progress);
        }
      })
    )
  );

  const successful: string[] = [];
  const failed: { fileName: string; error: string }[] = [];

  results.forEach((result, index) => {
    const fileName = files[index]?.name || `File ${index + 1}`;

    if (result.status === 'fulfilled' && result.value.success && result.value.url) {
      successful.push(result.value.url);
    } else {
      const error = result.status === 'rejected'
        ? result.reason?.message || 'Unknown error'
        : result.value?.error || 'Upload failed';
      failed.push({ fileName, error });
    }
  });

  return { successful, failed };
};
