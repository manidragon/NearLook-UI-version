import React from 'react';

// Restricts input to exclude numbers (0-9)
export const handleNameChange = (formik: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value.replace(/[0-9]/g, '');
  formik.setFieldValue(e.target.name, val);
};

// Restricts input to only numbers
export const handleNumberChange = (formik: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value.replace(/[^0-9]/g, '');
  formik.setFieldValue(e.target.name, val);
};
