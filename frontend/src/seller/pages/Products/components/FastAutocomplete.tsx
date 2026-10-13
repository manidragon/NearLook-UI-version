import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField as MuiTextField, Box } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface FastAutocompleteProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  label: React.ReactNode;
  placeholder?: string;
}

export const FastAutocomplete: React.FC<FastAutocompleteProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  label,
  placeholder
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const timeoutRef = useRef<any>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setInputValue(value || '');
    }
  }, [value]);

  const handleInputChange = (event: any, newInputValue: string, reason: string) => {
    setInputValue(newInputValue);
    if (reason === 'input' || reason === 'clear') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange(newInputValue);
      }, 1000);
    }
  };

  const handleChange = (event: any, newValue: string | null) => {
    const val = newValue || '';
    setInputValue(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange(val);
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      inputValue={inputValue}
      disabled={disabled}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onFocus={() => { isFocused.current = true; }}
      onBlur={() => { 
        isFocused.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onChange(inputValue); 
      }}
      renderInput={(params) => (
        <MuiTextField 
          {...params} 
          label={label}
          placeholder={placeholder}
          onFocus={(e) => {
            isFocused.current = true;
            if (params.inputProps.onFocus) params.inputProps.onFocus(e as any);
          }}
          onBlur={(e) => {
            isFocused.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            onChange(inputValue);
            if (params.inputProps.onBlur) params.inputProps.onBlur(e as any);
          }}
        />
      )}
    />
  );
};
