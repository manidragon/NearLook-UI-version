export const secureUrl = (url: string | undefined, width?: number): string => {
  if (!url) return '';
  let newUrl = url.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  
  // Add optimizations for Cloudinary URLs if not already present
  if (newUrl.includes('res.cloudinary.com')) {
    // If it doesn't have image upload path but is cloudinary, we might not be able to transform easily,
    // but typically they are /image/upload/
    if (newUrl.includes('/upload/')) {
      // Split the URL at /upload/
      const parts = newUrl.split('/upload/');
      let afterUpload = parts[1];
      
      // If there are existing transformations (like w_800 or f_auto), we should replace them if width is provided
      if (width && (afterUpload.includes('w_') || afterUpload.includes('f_auto') || afterUpload.includes('q_auto'))) {
          // just extract the actual filename/path after the transformations
          // Transformations are separated by / and usually before v12345 or the actual path
          const pathParts = afterUpload.split('/');
          // if first part doesn't contain a dot (it's not a filename), and doesn't start with v (not version), it's probably transformations
          if (pathParts[0].includes(',') || pathParts[0].includes('_')) {
             afterUpload = pathParts.slice(1).join('/');
          }
      }

      let transform = 'f_auto,q_auto';
      if (width) transform += `,w_${width},c_limit`;

      // Check if transformation string is already there
      if (!afterUpload.includes('f_auto') && !afterUpload.includes('q_auto')) {
        newUrl = `${parts[0]}/upload/${transform}/${afterUpload}`;
      } else if (afterUpload.startsWith('v1')) {
        // sometimes it's /upload/v1234/ - let's inject before v
        newUrl = `${parts[0]}/upload/${transform}/${afterUpload}`;
      }
    }
  }
  
  return newUrl;
};
