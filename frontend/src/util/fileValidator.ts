/**
 * Validates the size of an array of files or a FileList.
 * Filters out files that exceed the maximum size (default 5MB)
 * and shows an alert for each rejected file.
 *
 * @param files The FileList or Array of Files to validate
 * @param maxSizeMb The maximum allowed size in Megabytes (default 5)
 * @returns Array of Files that passed the validation
 */
export const validateImageSize = (files: FileList | File[] | null | undefined, maxSizeMb = 5): File[] => {
  if (!files) return [];
  
  const fileArray = Array.from(files);
  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  
  const validFiles: File[] = [];
  
  fileArray.forEach(file => {
    if (file.size > maxSizeBytes) {
      alert(`File "${file.name}" is larger than ${maxSizeMb}MB and will not be uploaded.`);
    } else {
      validFiles.push(file);
    }
  });
  
  return validFiles;
};
