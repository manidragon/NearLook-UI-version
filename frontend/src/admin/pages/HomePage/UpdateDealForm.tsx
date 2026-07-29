import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Typography, FormControl, Select, MenuItem, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchHomeCategories } from "../../../redux/Admin/AdminSlice";
import { updateDeal, getAllDeals } from "../../../redux/Admin/DealSlice";
import CustomLoader from "../../../components/CustomLoader";

const validationSchema = Yup.object({
    discount: Yup.number()
        .required("Discount is required")
        .min(1, "Discount must be at least 1%")
        .max(100, "Discount cannot exceed 100%"),
    category: Yup.string().required("Category is required"),
});

interface UpdateDealFormProps {
    deal: any;
    handleClose: () => void;
}

const UpdateDealForm = ({ deal, handleClose }: UpdateDealFormProps) => {
    const adminState = useAppSelector((state) => state.admin);
    const dealState = useAppSelector((state) => state.deal);
    const dispatch = useAppDispatch();
    const [showSuccess, setShowSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            discount: deal?.discount || 0,
            category: deal?.category?._id || deal?.category?.id || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await dispatch(
                    updateDeal({
                        id: deal._id || deal.id,
                        deal: {
                            discount: values.discount,
                            category: { _id: values.category },
                        },
                    })
                );
                setShowSuccess(true);
                setTimeout(() => {
                    handleClose();
                    dispatch(getAllDeals());
                }, 1000);
            } catch (error) {
                console.error("Update failed:", error);
            }
        },
    });

    useEffect(() => {
        dispatch(fetchHomeCategories());
    }, [dispatch]);

    return (
        <Box className="w-full">
            <div className="bg-white rounded-3xl p-2">
                
                {showSuccess && (
                    <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <Typography className="text-green-700 font-medium text-sm">
                            Deal updated successfully!
                        </Typography>
                    </div>
                )}
                
                <div className="text-center mb-6">
                    <Typography variant="h5" className="font-bold text-gray-900 tracking-tight">
                        Update Deal
                    </Typography>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    
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
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 font-medium">%</span>
                            </div>
                        </div>
                        {formik.touched.discount && formik.errors.discount && (
                            <p className="text-red-500 text-xs font-medium ml-1 mt-1">
                                {formik.errors.discount as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 ml-1">
                            Target Category
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
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316', borderWidth: '1px', boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.1)' },
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <em className="text-gray-400 not-italic">Select Category</em>
                                </MenuItem>
                                {adminState.categories.filter((c: any) => c.section === "DEALS").map((cat: any) => (
                                    <MenuItem key={cat._id} value={cat._id} className="py-2.5">
                                        {cat.description || cat.categoryId || cat.image || 'Category'}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.category && formik.errors.category && (
                                <p className="text-red-500 text-xs font-medium ml-1 mt-1">
                                    {formik.errors.category as string}
                                </p>
                            )}
                        </FormControl>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={dealState.loading || !formik.isValid}
                            className={`w-full relative overflow-hidden group py-3.5 px-4 rounded-2xl font-semibold text-white transition-all duration-300
                                ${dealState.loading || !formik.isValid 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-orange-500 to-orange-400 shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {dealState.loading ? (
                                    <>
                                        <CustomLoader size={20} color="inherit" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Update Deal</span>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </Box>
    );
};

export default UpdateDealForm;