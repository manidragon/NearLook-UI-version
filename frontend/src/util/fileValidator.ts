/**
 * Validates the size of an array of files or a FileList.
 * Filters out files that exceed the maximum size (default 5MB)
 * and shows an alert for each rejected file.
 *
 * @param files The FileList or Array of Files to validate
 * @param maxSizeMb The maximum allowed size in Megabytes (default 3)
 * @returns Array of Files that passed the validation
 */
export const validateImageSize = (
  files: FileList | File[] | null | undefined, 
  maxSizeMb = 3,
  onError?: (msg: string) => void
): File[] => {
  if (!files) return [];
  
  const fileArray = Array.from(files);
  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  
  const validFiles: File[] = [];
  
  fileArray.forEach(file => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

    if (!isValidExtension || !isValidType) {
      const msg = `File "${file.name}" has an unsupported format. Only JPG, JPEG, PNG, and WebP are allowed.`;
      if (onError) onError(msg);
      else console.warn(msg);
    } else if (file.size > maxSizeBytes) {
      const msg = `File "${file.name}" is larger than ${maxSizeMb}MB and will not be uploaded.`;
      if (onError) onError(msg);
      else console.warn(msg);
    } else {
      validFiles.push(file);
    }
  });
  
  return validFiles;
};
