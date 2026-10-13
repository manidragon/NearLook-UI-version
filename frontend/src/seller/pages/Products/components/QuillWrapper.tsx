import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface QuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export const QuillWrapper: React.FC<QuillWrapperProps> = ({ value, onChange, onBlur }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const isFocused = useRef(false);
  const timeoutRef = useRef<any>(null);

  // Sync from external value only when not actively editing
  useEffect(() => {
    if (!isFocused.current && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value]);

  const handleChange = (content: string) => {
    setLocalValue(content);
    
    // Debounce syncing to formik to prevent slow re-renders while typing
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(content);
    }, 800);
  };

  const handleBlur = () => {
    isFocused.current = false;
    // Flush immediately on blur
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(localValue);
    if (onBlur) onBlur();
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const modules = {
    toolbar: [
      [{ 'list': 'ordered' }, { 'list': 'bullet' }]
    ],
  };

  return (
    <ReactQuill
      theme="snow"
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      modules={modules}
    />
  );
};
