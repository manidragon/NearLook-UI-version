// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\ReturnRequestForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Alert, CircularProgress, Box, Typography, Chip, IconButton
} from '@mui/material';
import { CloudUpload, Close, Delete, Replay } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { createReturnRequest, clearReturnError } from '../../../redux/Customer/ReturnSlice';
import type { ReturnReason } from '../../../types/orderTypes';
import { uploadToCloudinary, uploadMultipleToCloudinary, type UploadResult } from '../../../util/uploadToCloudnary';

interface ReturnRequestFormProps {
  open: boolean;
  onClose: () => void;
  orderItemId: string;
  itemDetails?: {
    title: string;
    sellingPrice: number;
    image?: string;
    variant?: string;
    paymentMethod?: string;
  };
}

const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  open, onClose, orderItemId, itemDetails
}) => {
  const dispatch = useAppDispatch();
  const { loading, error, successMessage } = useAppSelector(state => state.returns);

  // ✅ Form State
  const [reason, setReason] = useState<ReturnReason | ''>('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const [refundMethod, setRefundMethod] = useState<'WALLET' | 'RAZORPAY'>('WALLET');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string>('');

  // ✅ Available Reasons
  const reasons: ReturnReason[] = [
    'Wrong size',
    'Defective/Damaged',
    'Wrong item delivered',
    'Not as described',
    'Changed mind',
    'Better price found',
    'Other'
  ];

  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!open) {
      dispatch(clearReturnError());
      setReason('');
      setDescription('');
      setImageFiles([]);
      setFormError('');
      setSubmitting(false);
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open && itemDetails?.paymentMethod) {
      setOrderPaymentMethod(itemDetails.paymentMethod);

      // Auto-select wallet for COD orders (business rule)
      if (itemDetails.paymentMethod === 'CASH_ON_DELIVERY') {
        setRefundMethod('WALLET');
      }
    }
  }, [open, itemDetails?.paymentMethod]);


  // ✅ Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      setFormError('Maximum 5 images allowed');
      return;
    }
    setImageFiles(prev => [...prev, ...files].slice(0, 5));
    setFormError('');
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit Handler - ONLY triggers on button click
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!reason) {
      setFormError('Please select a reason for return');
      return;
    }

    setSubmitting(true);
    setUploadingImages(imageFiles.length > 0); // Show upload indicator if images selected

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
          (fileName, progress) => {
            setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
          }
        );

        imageUrls = successful;

        // ✅ Handle partial failures: allow submit with successful uploads
        if (failed.length > 0) {
          console.warn('⚠️ Some images failed to upload:', failed);
          setUploadErrors(
            failed.reduce((acc, f) => ({ ...acc, [f.fileName]: f.error }), {})
          );

          // Optional: Block submit if NO images uploaded successfully
          if (imageUrls.length === 0) {
            setFormError('Failed to upload any images. Please try again or submit without images.');
            setSubmitting(false);
            return;
          }
        }
      }

      // ✅ Create return request with image URLs
      await dispatch(createReturnRequest({
        orderItemId,
        reason,
        description,
        images: imageUrls,
        refundMethod,
        jwt
      }));

      // ✅ Only close on success
      if (!error) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (err: any) {
      console.error('Submit error:', err);
      setFormError('Failed to submit return. Please try again.');
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
      maxWidth="sm"
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
      {/* ✅ FIX 1: Custom DialogTitle without 2 wrapping */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, bgcolor: 'primary.lighter' }}>
        <Typography component="span" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'primary.dark' }}>
            Request Return
        </Typography>
        <IconButton onClick={handleModalClose} size="small" disabled={submitting} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* ✅ FIX 2: Form with comprehensive event prevention */}
      <form
        onSubmit={handleSubmit}
        onReset={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <DialogContent dividers>
          {/* ✅ Item Summary Card */}
          {itemDetails && (
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Original Item
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    {itemDetails.image && (
                        <img
                            src={itemDetails.image}
                            alt={itemDetails.title}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    <Box sx={{ flex: 1 }}>
                        <Typography component="span" variant="subtitle1" fontWeight="bold" sx={{ display: 'block', mb: 0.5, lineHeight: 1.2 }}>
                            {itemDetails.title}
                        </Typography>
                        {itemDetails.variant && (
                            <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                Variant: {itemDetails.variant}
                            </Typography>
                        )}
                        <Typography component="span" variant="subtitle2" color="success.main" fontWeight="bold">
                            Refund Amount: ₹{itemDetails.sellingPrice}
                        </Typography>
                    </Box>
                </Box>
            </Box>
          )}

          {/* ✅ Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {formError && <Alert severity="warning" sx={{ mb: 2 }}>{formError}</Alert>}

          <TextField
            select
            fullWidth
            label="Reason for Return *"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value as ReturnReason);
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
            placeholder="Describe the issue with your item..."
            sx={{ mb: 2 }}
            disabled={submitting || loading}
            InputLabelProps={{
              sx: { fontSize: { xs: '0.8rem', sm: '1rem' } }
            }}
            InputProps={{
              sx: { fontSize: { xs: '0.85rem', sm: '1rem' } }
            }}
          />

          {/* ✅ Refund Method Selection */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Refund Method
            </Typography>

            {/* Wallet Option */}
            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 1.5 },
                p: { xs: 1.5, sm: 1.5 },
                borderRadius: 1,
                border: '2px solid',
                borderColor: refundMethod === 'WALLET' ? 'primary.main' : 'transparent',
                bgcolor: refundMethod === 'WALLET' ? 'white' : 'transparent',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.light' },
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 1.5 }, width: '100%' }}>
                <input
                  type="radio"
                  name="refundMethod"
                  value="WALLET"
                  checked={refundMethod === 'WALLET'}
                  onChange={(e) => setRefundMethod(e.target.value as 'WALLET')}
                  style={{ display: 'none' }}
                />
                <Box sx={{ mt: { xs: 0.5, sm: 0 }, flexShrink: 0, width: { xs: 16, sm: 20 }, height: { xs: 16, sm: 20 }, borderRadius: '50%', border: '2px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {refundMethod === 'WALLET' && <Box sx={{ width: { xs: 8, sm: 12 }, height: { xs: 8, sm: 12 }, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Refund to Wallet</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word', lineHeight: 1.3, mt: 0.25 }}>Instant credit • Use for future orders</Typography>
                  </Box>
                  <Chip label="Instant" size="small" color="success" variant="outlined" sx={{ flexShrink: 0, fontSize: '0.65rem', height: 20 }} />
                </Box>
              </Box>
            </Box>

            {/* Razorpay Option - Only show if order was paid via Razorpay */}
            {orderPaymentMethod === 'RAZORPAY' && (
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 1.5, sm: 1.5 },
                  mt: 1,
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: refundMethod === 'RAZORPAY' ? 'primary.main' : 'transparent',
                  bgcolor: refundMethod === 'RAZORPAY' ? 'white' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.light' },
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 1.5 }, width: '100%' }}>
                  <input
                    type="radio"
                    name="refundMethod"
                    value="RAZORPAY"
                    checked={refundMethod === 'RAZORPAY'}
                    onChange={(e) => setRefundMethod(e.target.value as 'RAZORPAY')}
                    style={{ display: 'none' }}
                  />
                  <Box sx={{ mt: { xs: 0.5, sm: 0 }, flexShrink: 0, width: { xs: 16, sm: 20 }, height: { xs: 16, sm: 20 }, borderRadius: '50%', border: '2px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {refundMethod === 'RAZORPAY' && <Box sx={{ width: { xs: 8, sm: 12 }, height: { xs: 8, sm: 12 }, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Refund to Original Payment Method</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word', lineHeight: 1.3, mt: 0.25 }}>2-5 business days • Back to card/UPI</Typography>
                    </Box>
                    <Chip label="2-5 days" size="small" color="warning" variant="outlined" sx={{ flexShrink: 0, fontSize: '0.65rem', height: 20 }} />
                  </Box>
                </Box>
              </Box>
            )}

            {/* COD Notice */}
            {orderPaymentMethod === 'CASH_ON_DELIVERY' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pl: 3 }}>
                💡 COD orders can only be refunded to wallet
              </Typography>
            )}
          </Box>

          {/* ✅ Image Upload */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Proof Images
            </Typography>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                e.stopPropagation();
                handleImageChange(e);
                // ✅ Clear previous errors when new files selected
                setUploadErrors({});
                setUploadProgress({});
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'none' }}
              id="return-images-upload"
              disabled={submitting || loading || uploadingImages || imageFiles.length >= 5}
            />

            <label htmlFor="return-images-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={uploadingImages ? <CircularProgress size={16} /> : <CloudUpload />}
                disabled={submitting || loading || uploadingImages || imageFiles.length >= 5}
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
                    ? `${imageFiles.length} image(s) selected (Max 5)`
                    : 'Click to upload proof images (Optional)'}
              </Button>
            </label>

            {/* ✅ Upload Errors Display */}
            {Object.keys(uploadErrors).length > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
                {Object.entries(uploadErrors).map(([fileName, error]) => (
                  <Typography key={fileName} variant="caption" color="error.main" display="block">
                    ❌ {fileName}: {error}
                  </Typography>
                ))}
              </Box>
            )}

            {/* ✅ Image Preview Chips with Progress */}
            {imageFiles.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                {imageFiles.map((file, idx) => {
                  const progress = uploadProgress[file.name];
                  const error = uploadErrors[file.name];

                  return (
                    <Box
                      key={idx}
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

                      {/* ✅ Error icon */}
                      {error && (
                        <Box sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="caption" color="white" fontSize="10px">!</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* ✅ Helper text */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Supported: JPG, PNG, WebP • Max 5MB each
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
                ? <CircularProgress size={20} color="inherit" />
                : <Replay fontSize="small" />
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
    </Dialog>
  );
};

export default ReturnRequestForm;