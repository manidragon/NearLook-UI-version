import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const useExternalLinks = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleGlobalClick = async (event: MouseEvent) => {
      // Find the closest anchor tag that was clicked
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      
      // If the link is an external http/https link
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // Only intercept if it's pointing away from our own domain
        const isInternal = href.includes(window.location.hostname);
        
        if (!isInternal) {
          event.preventDefault();
          try {
            await Browser.open({ url: href });
          } catch (error) {
            console.error('Failed to open external link in Capacitor Browser:', error);
          }
        }
      }
    };

    // Attach listener to document
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
};
