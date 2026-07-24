export const secureUrl = (url: string | undefined): string => {
  if (!url) return '';
  let newUrl = url.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  
  // Add f_auto,q_auto for Cloudinary URLs if not already present
  if (newUrl.includes('res.cloudinary.com') && !newUrl.includes('f_auto') && !newUrl.includes('q_auto')) {
    newUrl = newUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  }
  
  return newUrl;
};
