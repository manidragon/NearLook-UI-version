export const secureUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
};
