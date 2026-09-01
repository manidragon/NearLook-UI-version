import { useState, useEffect } from "react";
import Button from "../../../components/NeonButton";
import CustomLoader from "../../../components/CustomLoader";
import { Box, Typography, Snackbar, Alert, Portal } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateSeller } from "../../../redux/Seller/sellerSlice";
import { validateImageSize } from "../../../util/fileValidator";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";

interface LogoUploadFormProps {
  onClose: () => void;
}

const LogoUploadForm = ({ onClose }: LogoUploadFormProps) => {
  const sellers = useAppSelector((state) => state.sellers);
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellers.profile?.businessDetails?.logo) {
      setPreviewUrl(sellers.profile.businessDetails.logo);
    }
  }, [sellers.profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateImageSize(event.target.files, 3, (msg) => setError(msg));
    const file = validFiles[0];
    if (file) {
      // Validate file type and extension
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const validExts = /\.(jpg|jpeg|png|webp)$/i;
      
      if (!validTypes.includes(file.type) || !validExts.test(file.name)) {
        setError('Please select an image file (JPEG, JPG, PNG, WebP)');
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ✅ Upload to Cloudinary
      const result = await uploadToCloudinary(selectedFile, 'logo');
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to upload to Cloudinary');
      }

      // ✅ Update seller with Cloudinary URL
      await dispatch(
        updateSeller({
          businessDetails: {
            ...sellers.profile?.businessDetails,
            logo: result.url,
          },
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await dispatch(
        updateSeller({
          businessDetails: {
            ...sellers.profile?.businessDetails,
            logo: null,
          },
        })
      ).unwrap();
      
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove logo');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom className="text-center font-bold text-gray-600">
        Upload Business Logo
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
        {/* Logo Preview */}
        {previewUrl ? (
          <Box sx={{ 
            border: '2px dashed #1976d2', 
            borderRadius: 2, 
            p: 2,
            width: '100%',
            maxWidth: 300,
            textAlign: 'center'
          }}>
            <img 
              src={previewUrl} 
              alt="Logo Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 200,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }} 
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Current Logo
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 4,
            width: '100%',
            maxWidth: 300,
            textAlign: 'center'
          }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc' }} />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              No logo uploaded yet
            </Typography>
          </Box>
        )}

        {/* File Input */}
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ maxWidth: 300 }}
        >
          Choose Logo
          <input
            type="file"
            hidden
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
        </Button>

        {/* File Info */}
        {selectedFile && (
          <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
            <Typography variant="caption" color="primary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Typography>
          </Box>
        )}

        {/* Error Message removed from inline layout */}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 300, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CustomLoader size={24} /> : 'Upload Logo'}
          </Button>
          
          {previewUrl && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleRemoveLogo}
              disabled={uploading}
            >
              Remove
            </Button>
          )}
        </Box>

        {/* Guidelines */}
        <Box sx={{ textAlign: 'center', mt: 2, maxWidth: 300 }}>
          <Typography variant="caption" color="text.secondary">
            • Recommended size: 200x200px<br />
            • Max file size: 3MB<br />
            • Supported formats: JPEG, JPG, PNG, WebP<br />
            • Stored securely
          </Typography>
        </Box>
      </Box>
      <Portal>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
};

export default LogoUploadForm;
