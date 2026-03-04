import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    preserveExif: true,
  };

  try {
    return await imageCompression(file, options);
  } catch {
    // If compression fails, return original
    return file;
  }
}
