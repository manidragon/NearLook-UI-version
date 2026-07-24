import React from 'react';
import './CustomCheckbox.css';

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, checked, onChange, label }) => {
  return (
    <div className="custom-checkbox">
      <input 
        type="checkbox" 
        id={id} 
        name="checkbox-group"
        checked={checked} 
        onChange={onChange} 
      />
      <label htmlFor={id}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-check">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 12l2 2l4 -4" />
          <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
        </svg>
        <span>{label}</span>
      </label>
    </div>
  );
};

export default CustomCheckbox;
