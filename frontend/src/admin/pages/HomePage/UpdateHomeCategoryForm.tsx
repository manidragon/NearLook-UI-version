import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, Typography, Box, DialogActions, Autocomplete } from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateHomeCategory, createHomeCategory } from "../../../redux/Admin/AdminSlice";
import { getCategoriesByLevel } from "../../../redux/Admin/CategorySlice";
import type { HomeCategory } from "../../../types/homeDataTypes";
import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";
import CustomLoader from "../../../components/CustomLoader";

const validationSchema = Yup.object({
  image: Yup.string().required("Image is required"),
  categoryId: Yup.string().required("Target Product Category is required"),
  description: Yup.string()
    .max(100, "Description must be at most 100 characters")
    .required("Description is required"),
});

const UpdateHomeCategoryForm = ({
  category,
  section,
  isCreateMode,
  handleClose,
}: {
  category: HomeCategory | null;
  section: string;
  isCreateMode: boolean;
  handleClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const categoryState = useAppSelector((state) => state.category);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(category?.image || "");

  // Fetch level 3 categories on mount
  useEffect(() => {
    dispatch(getCategoriesByLevel(3));
  }, [dispatch]);

  const level3Categories = categoryState.categories || [];

  const formik = useFormik({
    initialValues: {
      image: category?.image || "",
      categoryId: category?.categoryId || "",
      description: category?.description || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        let finalImageUrl = category?.image || "";

        // If a new file is selected, upload it now
        if (selectedFile) {
          setUploading(true);
          try {
            const result = await uploadToCloudinary(selectedFile);
            if (result.success && result.url) {
              finalImageUrl = result.url;
            } else {
              throw new Error(result.error || "Upload failed");
            }
          } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image. Please try again.");
            setUploading(false);
            return; // Stop form submission if image upload fails
          }
          setUploading(false);
        }

        if (isCreateMode) {
          // Create new banner
          await dispatch(
            createHomeCategory({
              image: finalImageUrl,
              categoryId: values.categoryId,
              description: values.description,
              section: section,
            })
          );
        } else if (category?._id) {
          // Update existing banner
          await dispatch(
            updateHomeCategory({
              id: category._id,
              data: { image: finalImageUrl, categoryId: values.categoryId, description: values.description },
            })
          );
        }
        handleClose();
      } catch (error) {
        console.error("Error saving banner:", error);
        setUploading(false);
      }
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the file to be uploaded on form submission
    setSelectedFile(file);
    
    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    // Set a dummy value to pass Yup validation
    formik.setFieldValue("image", previewUrl);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', pt: 1, pb: 2, px: { xs: 1, sm: 2 } }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <AddPhotoAlternateIcon sx={{ color: '#ff6600', fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">
          {isCreateMode ? 'Add New Banner' : 'Edit Banner'}
        </Typography>
      </Box>

      {/* Image Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Banner Image * <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.8rem' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 3MB)</span>
        </Typography>
        <Button
          variant="outlined"
          component="label"
          disabled={formik.isSubmitting || uploading}
          fullWidth
          startIcon={!previewImage ? <CloudUploadIcon /> : null}
          sx={{ 
            minHeight: '64px',
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: formik.touched.image && formik.errors.image ? 'error.main' : '#ff6600',
            color: formik.touched.image && formik.errors.image ? 'error.main' : '#ff6600',
            backgroundColor: 'rgba(255, 102, 0, 0.02)',
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: '2px',
              borderColor: '#e65c00',
              backgroundColor: 'rgba(255, 102, 0, 0.08)',
            }
          }}
        >
          {previewImage ? '✅ IMAGE SELECTED - CLICK TO CHANGE' : 'UPLOAD IMAGE (RECOMMENDED: 800X400PX)'}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
        
        {previewImage && (
          <Box sx={{ mt: 3, textAlign: 'center', p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fafafa' }}>
            <img
              src={previewImage}
              alt="Preview"
              style={{ 
                maxWidth: "100%", 
                maxHeight: "300px",
                borderRadius: "8px",
                objectFit: "contain"
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontWeight: '500' }}>
              Current Image Preview
            </Typography>
          </Box>
        )}
        
        {formik.touched.image && formik.errors.image && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: '500' }}>
            {formik.errors.image}
          </Typography>
        )}
      </Box>

      {/* Category ID Section (Autocomplete Dropdown) */}
      <Box sx={{ mb: 4 }}>
        <Autocomplete
          fullWidth
          id="categoryId"
          options={level3Categories}
          getOptionLabel={(option: any) => 
            option.name ? `${option.name} (${option.categoryId})` : option.categoryId || option
          }
          isOptionEqualToValue={(option: any, value: any) => 
            (option.categoryId || option) === (value.categoryId || value)
          }
          value={
            level3Categories.find((c: any) => c.categoryId === formik.values.categoryId) || 
            (formik.values.categoryId ? { categoryId: formik.values.categoryId, name: formik.values.categoryId } : null)
          }
          onChange={(_, newValue: any) => {
            formik.setFieldValue("categoryId", newValue ? newValue.categoryId : "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Target Product Category *"
              placeholder="Search level 3 categories..."
              error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              helperText={
                formik.touched.categoryId && formik.errors.categoryId
                  ? formik.errors.categoryId
                  : "Search and select the product category this deal applies to"
              }
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ff6600' }
              }}
            />
          )}
        />
      </Box>

      {/* Description Section */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          id="description"
          name="description"
          label="Description *"
          multiline
          rows={3}
          placeholder="Write a brief description about this banner (max 100 characters)"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={
            formik.touched.description && formik.errors.description
              ? `${formik.errors.description} (${formik.values.description.length}/100)`
              : `${formik.values.description.length}/100 characters max`
          }
          inputProps={{ maxLength: 100 }}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#ff6600',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff6600',
            }
          }}
        />
      </Box>

      {/* Action Buttons */}
      <DialogActions sx={{ px: 0, pt: 2, pb: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={formik.isSubmitting || uploading}
          startIcon={<CancelIcon />}
          sx={{ color: '#ff6600', fontWeight: 'bold' }}
        >
          CANCEL
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={!formik.isSubmitting && !uploading ? <SaveIcon /> : null}
          disabled={formik.isSubmitting || uploading}
          sx={{ 
            minWidth: '160px',
            bgcolor: '#ff6600',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#e65c00',
            }
          }}
        >
          {formik.isSubmitting || uploading ? (
            <CustomLoader size={24} color="inherit" />
          ) : isCreateMode ? (
            'CREATE BANNER'
          ) : (
            'UPDATE BANNER'
          )}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default UpdateHomeCategoryForm;