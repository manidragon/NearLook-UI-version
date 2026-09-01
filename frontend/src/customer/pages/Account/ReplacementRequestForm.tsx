import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert, Box, Typography, Chip, IconButton, Snackbar } from '@mui/material';
import { Close, SwapHoriz, CloudUpload, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { createReplacementRequest, clearReturnError } from '../../../redux/Customer/ReturnSlice';
import { uploadMultipleToCloudinary } from '../../../util/uploadToCloudnary';
import type { OrderItem } from '../../../types/orderTypes';
import CustomLoader from "../../../components/CustomLoader";

interface ReplacementRequestFormProps {
    open: boolean;
    onClose: () => void;
    orderItem: OrderItem;
    orderId: string;
}

const ReplacementRequestForm: React.FC<ReplacementRequestFormProps> = ({
    open, onClose, orderItem, orderId
}) => {
    const dispatch = useAppDispatch();
    const { loading, error, successMessage } = useAppSelector(state => state.returns);

    // ✅ Form State
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

    // ✅ Available Reasons
    const reasons = [
        'Wrong size',
        'Defective/Damaged',
        'Wrong item delivered',
        'Not as described',
        'Changed mind',
        'Better price found',
        'Other'
    ];

    // ✅ Available Variants (ONLY exact same variant)
    const availableVariants = React.useMemo(() => {
        if (!orderItem?.product?.variants) return [];

        // Strategy 1: Match by variantId if available
        let currentVariant: any = orderItem.variantId
            ? orderItem.product.variants.find((v: any) => String(v._id) === String(orderItem.variantId))
            : null;

        // Strategy 2: Fallback to matching by selling price
        if (!currentVariant && orderItem.sellingPrice) {
            currentVariant = orderItem.product.variants.find(
                (v: any) => v.offers?.[0]?.sellingPrice === orderItem.sellingPrice
            );
        }

        if (!currentVariant) return [];

        // Check stock availability
        const hasStock = currentVariant.offers?.some(
            (o: any) => o.stock > 0 && o.isActive !== false
        );

        return hasStock ? [currentVariant] : [];
    }, [orderItem]);

    // ✅ Auto-select variant when available
    useEffect(() => {
        if (open && availableVariants.length === 1 && !selectedVariant) {
            setSelectedVariant(availableVariants[0]);
        }
    }, [availableVariants, open, selectedVariant]);

    // ✅ Reset form when modal closes
    useEffect(() => {
        if (!open) {
            dispatch(clearReturnError());
            setSelectedVariant(null);
            setReason('');
            setDescription('');
            setImageFiles([]);
            setFormError('');
            setSubmitting(false);
            setUploadingImages(false);
            setUploadProgress({});
            setUploadErrors({});
        }
    }, [open, dispatch]);

    // ✅ Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 4) {
            setFormError('Maximum 4 images allowed');
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        const validFiles = files.filter(file => {
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            if (!validTypes.includes(file.type) || !validExtensions.includes(extension)) {
                setFormError('Invalid file format. Supported: JPEG, JPG, PNG, WebP');
                return false;
            }
            if (file.size > maxSize) {
                setFormError('Image size exceeds 5MB limit');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setImageFiles(prev => [...prev, ...validFiles].slice(0, 4));
            if (validFiles.length === files.length) {
                setFormError('');
            }
            // Clear previous errors when new files selected
            setUploadErrors({});
            setUploadProgress({});
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ Submit Handler - Upload images on submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedVariant) {
            setFormError('Replacement variant not available');
            return;
        }
        if (!reason) {
            setFormError('Please select a reason for replacement');
            return;
        }

        setSubmitting(true);
        setUploadingImages(imageFiles.length > 0);

        try {
            const jwt = localStorage.getItem('jwt') || '';
            if (!jwt) {
                setFormError('Authentication required. Please login again.');
                setSubmitting(false);
                return;
            }

            // ✅ Upload images to Cloudinary (if any selected)
            let imageUrls: string[] = [];

            if (imageFiles.length > 0) {

                const { successful, failed } = await uploadMultipleToCloudinary(
                    imageFiles,
                    undefined,
                    (fileName, progress) => {
                        setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
                    }
                );

                imageUrls = successful;

                // ✅ Handle partial failures
                if (failed.length > 0) {
                    console.warn('⚠️ Some images failed to upload:', failed);
                    setUploadErrors(
                        failed.reduce((acc, f) => ({ ...acc, [f.fileName]: f.error }), {})
                    );

                    // Block submit if NO images uploaded successfully
                    if (imageUrls.length === 0) {
                        setFormError('Failed to upload any images. Please try again or submit without images.');
                        setSubmitting(false);
                        return;
                    }
                }
            }

            // Prepare replacement variant data
            const replacementVariant = {
                variantId: selectedVariant._id,
                color: selectedVariant.color,
                specifications: selectedVariant.specifications,
                sellingPrice: selectedVariant.offers?.[0]?.sellingPrice,
                stock: selectedVariant.offers?.[0]?.stock,
                images: selectedVariant.images
            };

            // Create replacement request
            await dispatch(createReplacementRequest({
                orderItemId: orderItem._id,
                reason,
                description,
                images: imageUrls,
                replacementVariant,
                jwt
            }));

            // Close on success
            if (!error) {
                setTimeout(() => {
                    onClose();
                }, 1500);
            }

        } catch (err: any) {
            console.error('Submit error:', err);
            setFormError('Failed to submit replacement. Please try again.');
        } finally {
            setSubmitting(false);
            setUploadingImages(false);
            setUploadProgress({});
            setUploadErrors({});
        }
    };

    // ✅ Handle modal close
    const handleModalClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (submitting) return;
                if (reason === 'backdropClick') return;
                handleModalClose();
            }}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={submitting}
            sx={{ zIndex: 10000 }}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, bgcolor: 'primary.lighter' }}>
                <Typography component="span" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'primary.dark' }}>
                    Request Replacement
                </Typography>
                <IconButton onClick={handleModalClose} size="small" disabled={submitting} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* ✅ Item Summary */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Original Item
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            {orderItem?.product?.images?.[0] && (
                                <img
                                    src={orderItem.product.images[0]}
                                    alt={orderItem.product?.title}
                                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <Box sx={{ flex: 1 }}>
                                <Typography component="span" variant="subtitle1" fontWeight="bold" sx={{ display: 'block', mb: 0.5, lineHeight: 1.2 }}>
                                    {orderItem?.product?.title}
                                </Typography>
                                <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                    Size: {orderItem?.size}
                                </Typography>
                                <Typography component="span" variant="subtitle2" color="success.main" fontWeight="bold">
                                    ₹{orderItem?.sellingPrice}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* ✅ Alerts */}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <TextField
                        select
                        fullWidth
                        label="Reason for Replacement *"
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setFormError('');
                        }}
                        required
                        sx={{ mb: 2 }}
                        disabled={submitting || loading}
                        InputLabelProps={{
                            sx: { fontSize: { xs: '0.8rem', sm: '1rem' } }
                        }}
                        InputProps={{
                            sx: { fontSize: { xs: '0.85rem', sm: '1rem' } }
                        }}
                        SelectProps={{
                            MenuProps: {
                                sx: { zIndex: 10001 }
                            }
                        }}
                    >
                        {reasons.map((r) => (
                            <MenuItem
                                key={r}
                                value={r}
                            >
                                {r}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* ✅ Description Field */}
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional Details (Optional)"
                        value={description}
                        onChange={(e) => {
                            e.stopPropagation();
                            setDescription(e.target.value);
                        }}
                        placeholder="Describe why you want to replace this item..."
                        sx={{ mb: 2 }}
                        disabled={submitting || loading}
                        InputLabelProps={{
                            sx: { fontSize: { xs: '0.8rem', sm: '1rem' } }
                        }}
                        InputProps={{
                            sx: { fontSize: { xs: '0.85rem', sm: '1rem' } }
                        }}
                    />

                    {/* ✅ Replacement Variant Display */}
                    {availableVariants.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Replacement Item
                            </Typography>

                            <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
                                <Box sx={{ position: 'absolute', top: -10, right: 16, bgcolor: 'white', px: 1, borderRadius: 1, border: '1px solid', borderColor: 'primary.light', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                                        Exact Match ✅
                                    </Typography>
                                </Box>
                                {availableVariants[0].images?.[0] && (
                                    <img
                                        src={availableVariants[0].images[0]}
                                        alt={availableVariants[0].color}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    />
                                )}

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                        {availableVariants[0].color}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                        {availableVariants[0].specifications &&
                                            Object.entries(availableVariants[0].specifications).map(([key, value]: [string, unknown]) => {
                                                const displayValue = String(value);
                                                return (
                                                    <Chip key={key} label={`${key}: ${displayValue}`} size="small" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', fontSize: '0.7rem' }} />
                                                );
                                            })
                                        }
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                            ₹{availableVariants[0].offers?.[0]?.sellingPrice}
                                        </Typography>

                                        {availableVariants[0].offers?.[0]?.stock <= 5 && availableVariants[0].offers?.[0]?.stock > 0 && (
                                            <Chip
                                                label={`Only ${availableVariants[0].offers[0].stock} left`}
                                                size="small"
                                                color="warning"
                                                variant="filled"
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* ✅ Image Upload */}
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Proof Images
                        </Typography>

                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => {
                                e.stopPropagation();
                                handleImageChange(e);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'none' }}
                            id="replacement-images-upload"
                            disabled={submitting || loading || uploadingImages || imageFiles.length >= 4}
                        />

                        <label htmlFor="replacement-images-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={uploadingImages ? <CustomLoader size={16} /> : <CloudUpload />}
                                disabled={submitting || loading || uploadingImages || imageFiles.length >= 4}
                                fullWidth
                                onClick={(e) => e.stopPropagation()}
                                sx={{ 
                                    py: 2.5, 
                                    borderStyle: 'dashed', 
                                    borderWidth: 2,
                                    borderRadius: 2,
                                    bgcolor: '#fafafa',
                                    color: 'text.secondary',
                                    '&:hover': { borderStyle: 'dashed', borderWidth: 2, bgcolor: 'primary.lighter' }
                                }}
                            >
                                {uploadingImages
                                    ? `Uploading ${Object.keys(uploadProgress).length}/${imageFiles.length}...`
                                    : imageFiles.length > 0
                                        ? `${imageFiles.length} image(s) selected (Max 4)`
                                        : 'Click to upload proof images (Optional)'}
                            </Button>
                        </label>

                        {/* ✅ Upload Errors Display */}
                        {Object.keys(uploadErrors).length > 0 && (
                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                                {Object.entries(uploadErrors).map(([fileName, error]) => (
                                    <Typography key={fileName} variant="caption" color="error.main" display="block" fontWeight="medium">
                                        ❌ {fileName}: {error}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        {/* ✅ Image Preview Chips with Progress */}
                        {imageFiles.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                                {imageFiles.map((file, idx) => {
                                    const progress = uploadProgress[file.name];
                                    const error = uploadErrors[file.name];

                                    return (
                                        <Box key={idx} sx={{ position: 'relative' }}>
                                            <Box
                                                sx={{
                                                    width: 72,
                                                    height: 72,
                                                    borderRadius: 2,
                                                    border: '2px solid',
                                                    borderColor: error ? 'error.main' : 'grey.200',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    bgcolor: 'grey.100',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt="preview" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                                {!submitting && !uploadingImages && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeImage(idx)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            bgcolor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            p: 0.25,
                                                            '&:hover': { bgcolor: 'error.main' }
                                                        }}
                                                    >
                                                        <Close sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                )}

                                            {/* ✅ Progress bar overlay */}
                                            {progress !== undefined && !error && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    bgcolor: 'rgba(255,255,255,0.8)'
                                                }}>
                                                    <Box sx={{
                                                        width: `${progress}%`,
                                                        height: '100%',
                                                        bgcolor: 'primary.main',
                                                        transition: 'width 0.2s'
                                                    }} />
                                                </Box>
                                            )}
                                            </Box>

                                            {/* ✅ Error icon */}
                                            {error && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    bgcolor: 'error.main',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    <Typography variant="caption" color="white" fontWeight="bold" fontSize="12px">!</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {/* ✅ Helper text */}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                            Supported: JPEG, JPG, PNG, WebP • Max 5MB each
                        </Typography>
                    </Box>
                </DialogContent>

                {/* ✅ Actions */}
                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button
                        onClick={(e) => { e.stopPropagation(); handleModalClose(); }}
                        disabled={submitting || loading}
                        sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting || loading || uploadingImages || !reason}
                        startIcon={
                            submitting || uploadingImages
                                ? <CustomLoader size={20} color="inherit" />
                                : <SwapHoriz fontSize="small" />
                        }
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(255, 90, 0, 0.39)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {uploadingImages
                            ? 'Uploading...'
                            : submitting || loading
                                ? 'Submitting...'
                                : 'Submit Request'}
                    </Button>
                </DialogActions>
            </form>

            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={!!formError}
                autoHideDuration={4000}
                onClose={() => setFormError('')}
                style={{ zIndex: 13000 }}
            >
                <Alert onClose={() => setFormError('')} severity="warning" sx={{ width: '100%', boxShadow: 3 }}>
                    {formError}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default ReplacementRequestForm;