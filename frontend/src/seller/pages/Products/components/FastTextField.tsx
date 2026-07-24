import React, { useState, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export const FastTextField: React.FC<TextFieldProps> = (props) => {
  const [localValue, setLocalValue] = useState(props.value ?? '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(props.value ?? '');
  }, [props.value]);

  const debouncedOnChange = (name: string, value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (props.onChange) {
        props.onChange({
          target: { name, value }
        } as any);
      }
    }, 300);
  };

  const flushDebounce = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      // We can't synchronously flush the latest value easily without tracking it, 
      // but onBlur will capture it if needed.
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    const name = e.target.name;
    setLocalValue(val);
    debouncedOnChange(name, val);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    flushDebounce();
    if (props.onChange) {
      props.onChange(e); // Ensure final value is synced on blur
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return <TextField {...props} value={localValue} onChange={handleChange} onBlur={handleBlur} />;
};


