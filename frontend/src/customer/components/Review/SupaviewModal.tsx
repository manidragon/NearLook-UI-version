import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Modal, Box, Rating } from '@mui/material';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { uploadToCloudinary } from '../../../util/uploadToCloudnary';
import { useAppDispatch } from '../../../redux/Store';
import { createReview, fetchReviewsByProductId } from '../../../redux/Customer/ReviewSlice';
import { createSellerReview, fetchSellerReviews } from '../../../redux/Customer/SellerReviewSlice';
import { useNavigate } from 'react-router-dom';
import './SupaviewModal.css';
import CustomLoader from "../../../components/CustomLoader";

interface SupaviewModalProps {
    open: boolean;
    onClose: () => void;
    reviewType: 'product' | 'seller';
    targetId: string | undefined;
    orderItemId?: string;
    existingReview?: any;
}

interface SupaviewRequest {
    reviewText: string;
    rating: number;
    images: string[];
}

const SupaviewModal: React.FC<SupaviewModalProps> = ({ open, onClose, reviewType, targetId, orderItemId, existingReview }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const isViewMode = !!existingReview;
    const existingImages = existingReview?.productImages || existingReview?.images || [];

    const formik = useFormik<SupaviewRequest>({
        initialValues: {
            reviewText: '',
            rating: 5,
            images: [],
        },
        validationSchema: Yup.object({
            reviewText: Yup.string()
                .required('Message is required')
                .min(5, 'Message must be at least 5 characters long'),
            rating: Yup.number()
                .required('Rating is required')
                .min(1, 'Rating must be at least 1')
                .max(5, 'Rating cannot be more than 5'),
        }),
        onSubmit: async (values) => {
            if (!targetId) {
                setSubmitError('Target ID is missing.');
                return;
            }
            
            setSubmitError('');
            setIsSubmittingForm(true);

            try {
                // 1. Upload images first
                const uploadedUrls: string[] = [];
                for (const file of selectedFiles) {
                    const result = await uploadToCloudinary(file);
                    if (result.success && result.url) {
                        uploadedUrls.push(result.url);
                    } else {
                        throw new Error(result.error || "Image upload failed");
                    }
                }

                // 2. Dispatch the review with uploaded URLs
                if (reviewType === 'product') {
                    await dispatch(createReview({
                        productId: targetId,
                        orderItemId: orderItemId,
                        review: {
                            reviewText: values.reviewText,
                            rating: values.rating,
                            productImages: uploadedUrls
                        },
                        jwt: localStorage.getItem("jwt") || ""
                    }));
                    await dispatch(fetchReviewsByProductId({ productId: targetId }));
                } else {
                    await dispatch(createSellerReview({
                        sellerId: targetId,
                        orderItemId: orderItemId,
                        reviewText: values.reviewText,
                        rating: values.rating,
                        images: uploadedUrls
                    }));
                    await dispatch(fetchSellerReviews({ sellerId: targetId }));
                }
                
                // Reset and close
                formik.resetForm();
                setSelectedFiles([]);
                setPreviewUrls([]);
                onClose();
            } catch (error: any) {
                setSubmitError(error.message || 'Failed to submit review');
            } finally {
                setIsSubmittingForm(false);
            }
        },
    });

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFiles([...selectedFiles, file]);
        setPreviewUrls([...previewUrls, URL.createObjectURL(file)]);
        event.target.value = ""; 
    };

    const handleRemoveImage = (index: number) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);

        const updatedPreviews = [...previewUrls];
        // Free memory
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);
        setPreviewUrls(updatedPreviews);
    };

    // Prevent closing when clicking inside the modal
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-labelledby="supaview-modal-title"
        >
            <Box className="supaviews-container" onClick={handleModalClick}>
                <div className="supaviews">
                    <img className="supaviews__logo" src="https://app.supabase.io/img/supabase-logo.svg" alt="Supabase Logo" />
                    <div className="supaviews__gradient"></div>
                    
                    <div className="supaviews__add">
                        <div className="supaview">
                            <h1 className="supaview__title" id="supaview-modal-title">
                                {isViewMode ? 'Your Review' : (reviewType === 'product' ? 'Rate the product' : 'Rate the seller')}
                            </h1>
                            
                            {isViewMode ? (
                                <div className="supaview-details">
                                    <div className="mb-5 flex justify-center mt-4">
                                        <Rating
                                            name="read-only"
                                            value={existingReview.rating}
                                            readOnly
                                            size="large"
                                            sx={{ 
                                                fontSize: '3rem',
                                                color: '#d1d5db',
                                                '& .MuiRating-iconFilled': {
                                                    color: '#FF5A00',
                                                    textShadow: '0 0 6px rgba(255, 90, 0, 0.4)'
                                                }
                                            }}
                                        />
                                    </div>

                                    {existingImages.length > 0 && (
                                        <div className="supaview__images mb-4" style={{justifyContent: 'center', flexWrap: 'wrap'}}>
                                            {existingImages.map((img: string, idx: number) => (
                                                <div key={idx} className="supaview__image-wrapper" style={{margin: '0 5px 10px 5px'}}>
                                                    <img src={img} alt="review" className="supaview__image-preview" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="supaview__copy p-4 mt-2" style={{backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee'}}>
                                        <p className="text-gray-700 whitespace-pre-wrap" style={{margin: 0, fontSize: '15px'}}>{existingReview.reviewText}</p>
                                    </div>

                                    <button 
                                        type="button" 
                                        className="supaview__submit mt-6"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {submitError && (
                                        <div className="supaerror mb-4 p-3 rounded text-sm">
                                            {submitError}
                                        </div>
                                    )}

                                    <form id="review" onSubmit={formik.handleSubmit}>
                                        <div className="mb-5 flex justify-center">
                                            <Rating
                                                name="rating"
                                                size="large"
                                                value={formik.values.rating}
                                                onChange={(event, newValue) => {
                                                    formik.setFieldValue('rating', newValue || 0);
                                                }}
                                                sx={{ 
                                                    fontSize: '3rem',
                                                    color: '#d1d5db',
                                                    '& .MuiRating-iconFilled': {
                                                        color: '#FF5A00',
                                                        textShadow: '0 0 6px rgba(255, 90, 0, 0.4)'
                                                    },
                                                    '& .MuiRating-iconHover': {
                                                        color: '#E64D00'
                                                    }
                                                }}
                                            />
                                        </div>
                                        {formik.touched.rating && formik.errors.rating && (
                                            <div className="text-red-500 text-sm mb-3 text-center">{formik.errors.rating}</div>
                                        )}

                                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '8px', marginTop: '0' }}>
                                            Supported: JPEG, JPG, PNG, WebP (Max: 3MB)
                                        </p>
                                        <div className="supaview__images">
                                            {previewUrls.map((previewUrl, idx) => (
                                                <div key={idx} className="supaview__image-wrapper">
                                                    <img src={previewUrl} alt="upload preview" className="supaview__image-preview" />
                                                    <button 
                                                        type="button" 
                                                        className="supaview__remove-img"
                                                        onClick={() => handleRemoveImage(idx)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <label className="supaview__image-upload-btn relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={handleImageChange}
                                                />
                                                <AddPhotoAlternateIcon fontSize="large" />
                                            </label>
                                        </div>

                                        <div className="supaview__copy">
                                            <textarea 
                                                name="reviewText" 
                                                placeholder={`Describe your experience with this ${reviewType}...`} 
                                                rows={5}
                                                value={formik.values.reviewText}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={formik.touched.reviewText && formik.errors.reviewText ? 'border-red-500' : ''}
                                            ></textarea>
                                            {formik.touched.reviewText && formik.errors.reviewText && (
                                                <div className="text-red-500 text-sm mt-[-10px] mb-3">{formik.errors.reviewText}</div>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="supaview__submit"
                                            disabled={isSubmittingForm}
                                        >
                                            {isSubmittingForm ? 'Uploading & Submitting...' : 'Submit review'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default SupaviewModal;
