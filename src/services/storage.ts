import { supabase } from "./supabase";
import imageCompression from "browser-image-compression";

/**
 * Uploads a file to Supabase Storage with optimization
 * @param file The file to upload
 * @param bucket The name of the bucket in Supabase (default: 'notes')
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (file: File, bucket: string = "notes"): Promise<string> => {
  let fileToUpload: File | Blob = file;

  // Optimize image if it's an image
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: "image/png", // Force PNG
    };

    try {
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.warn("Optimization failed, uploading original file", error);
    }
  }

  // Create a unique filename
  const timestamp = Date.now();
  const extension = "png"; // Force extension to png
  const fileName = `images/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage given its public URL
 * @param url The public URL of the file to delete
 * @param bucket The bucket name (default: 'notes')
 */
export const deleteFile = async (url: string, bucket: string = "notes"): Promise<void> => {
  try {
    // Extract path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/public/${bucket}/`);
    
    if (pathParts.length < 2) {
      console.warn("Could not extract path from Supabase URL:", url);
      return;
    }

    const path = pathParts[1];
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting from Supabase:", error);
  }
};
