import React from 'react';
import { cn } from '../lib/utils';

export interface CustomLoaderProps {
  className?: string;
  size?: number | string;
  color?: string;
  sx?: any;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ className, size, color, sx }) => {
  // MUI CircularProgress passes size (often in px). We can optionally scale it.
  const scale = size && typeof size === 'number' ? size / 108 : 1;
  const transformStyle = size ? { transform: `scale(${scale})`, transformOrigin: 'center' } : {};

  return (
    <div 
      className={cn("flex justify-center items-center p-2", className)} 
      style={{ ...transformStyle, ...sx }}
    >
      <span className="loader"></span>
    </div>
  );
};

export default CustomLoader;
