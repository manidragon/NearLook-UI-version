import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography, CircularProgress } from "@mui/material"
import { useFormik } from 'formik';
import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { createDeal, getAllDeals } from '../../../redux/Admin/DealSlice';
import * as Yup from "yup";

const validationSchema = Yup.object({
  discount: Yup.number()
    .required("Discount is required")
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  category: Yup.string().required("Category is required"),
});

const CreateDealForm = () => {
  const adminState = useAppSelector(state => state.admin);
  const dealState = useAppSelector(state => state.deal);
  const dispatch = useAppDispatch();
  const [showSuccess, setShowSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      discount: 0,
      category: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(createDeal({
          discount: values.discount, 
          category: { _id: values.category }
        }));
        setShowSuccess(true);
        formik.resetForm();
        setTimeout(() => {
          setShowSuccess(false);
          dispatch(getAllDeals());
        }, 1500);
      } catch (error) {
        console.error("Create failed:", error);
      }
    },
  });

  return (
    <Box className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
        
        {showSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Typography className="text-green-700 font-medium text-sm">
              Deal created successfully!
            </Typography>
          </div>
        )}

        <div className="text-center mb-8">
          <Typography variant="h5" className="font-bold text-gray-900 tracking-tight">
            Create New Deal
          </Typography>
          <Typography variant="body2" className="text-gray-500 mt-1">
            Fill in the details below to launch a new promotional offer.
          </Typography>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          
          <div className="space-y-1.5">
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 ml-1">
              Discount Percentage (%)
            </label>
            <div className="relative">
              <input
                id="discount"
                name="discount"
                type="number"
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 outline-none
                  ${formik.touched.discount && formik.errors.discount 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30' 
                    : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-gray-50/50 hover:bg-white'}`}
                placeholder="e.g. 20"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-400 font-medium">%</span>
              </div>
            </div>
            {formik.touched.discount && formik.errors.discount && (
              <p className="text-red-500 text-xs font-medium ml-1 mt-1 animate-slide-down">
                {formik.errors.discount}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 ml-1">
              Select Category
            </label>
            <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                displayEmpty
                className="rounded-2xl bg-gray-50/50 hover:bg-white transition-colors duration-200"
                sx={{
                  borderRadius: '1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                    transition: 'border-color 0.2s',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f97316',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f97316',
                    borderWidth: '1px',
                    boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.1)',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em className="text-gray-400 not-italic">Select a target category</em>
                </MenuItem>
                {adminState.categories.filter((c: any) => c.section === "DEALS").map((item: any) => (
                  <MenuItem key={item._id} value={item._id} className="py-3">
                    {item.description || item.categoryId || item.name || 'Category'}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-red-500 text-xs font-medium ml-1 mt-1 animate-slide-down">
                  {formik.errors.category}
                </p>
              )}
            </FormControl>
          </div>

          <button
            type="submit"
            disabled={dealState.loading || !formik.isValid}
            className={`w-full relative overflow-hidden group py-3.5 px-4 rounded-2xl font-semibold text-white transition-all duration-300
              ${dealState.loading || !formik.isValid 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            <div className="flex items-center justify-center gap-2">
              {dealState.loading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Launch Deal</span>
              )}
            </div>
            {/* Glossy overlay effect */}
            {!dealState.loading && formik.isValid && (
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            )}
          </button>
        </form>
      </div>
    </Box>
  )
}

export default CreateDealForm;