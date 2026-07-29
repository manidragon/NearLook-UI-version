import { useState, useEffect } from "react";
import Alert from "../../../components/CustomAlert";
import Button from "../../../components/NeonButton";
import CustomLoader from "../../../components/CustomLoader";
import { Box, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateSeller } from "../../../redux/Seller/sellerSlice";
import { validateImageSize } from "../../../util/fileValidator";
// ✅ Cloudinary Upload Function
const uploadToCloudinary = async (file: File) => {
  const cloud_name = "dt6nu9oqs";
  const upload_preset = "nearlook";
  const url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
  
  if (file) {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", upload_preset);
    data.append("cloud_name", cloud_name);
    const res = await fetch(url, {
      method: "post",
      body: data,
    });
    
    const fileData = await res.json();
    return fileData.url;
  } else {
    console.log("error");
  }
};
interface BannerUploadFormProps {
  onClose: () => void;
}
const BannerUploadForm = ({ onClose }: BannerUploadFormProps) => {
  const sellers = useAppSelector((state) => state.sellers);
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (sellers.profile?.businessDetails?.banner) {
      setPreviewUrl(sellers.profile.businessDetails.banner);
    }
  }, [sellers.profile]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateImageSize(event.target.files);
    const file = validFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, GIF)');
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
      const cloudinaryUrl = await uploadToCloudinary(selectedFile);
      
      if (!cloudinaryUrl) {
        throw new Error('Failed to upload to Cloudinary');
      }
      // ✅ Update seller with Cloudinary URL
      await dispatch(
        updateSeller({
          businessDetails: {
            ...sellers.profile?.businessDetails,
            banner: cloudinaryUrl,
          },
        })
      ).unwrap();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveBanner = async () => {
    try {
      await dispatch(
        updateSeller({
          businessDetails: {
            ...sellers.profile?.businessDetails,
            banner: null,
          },
        })
      ).unwrap();
      
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove banner');
    }
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom className="text-center font-bold text-gray-600">
        Upload Storefront Banner
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
        {/* Banner Preview */}
        {previewUrl ? (
          <Box sx={{ 
            border: '2px dashed #1976d2', 
            borderRadius: 2, 
            p: 2,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <img 
              src={previewUrl} 
              alt="Banner Preview" 
              style={{ 
                width: '100%', 
                height: 150,
                objectFit: 'cover',
                borderRadius: '8px'
              }} 
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Current Banner
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc' }} />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              No banner uploaded yet
            </Typography>
          </Box>
        )}
        {/* File Input */}
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ maxWidth: 400 }}
        >
          Choose Banner
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {/* File Info */}
        {selectedFile && (
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="caption" color="primary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Typography>
          </Box>
        )}
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
            {error}
          </Alert>
        )}
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 400, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CustomLoader size={24} /> : 'Upload to Cloudinary'}
          </Button>
          
          {previewUrl && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleRemoveBanner}
              disabled={uploading}
            >
              Remove
            </Button>
          )}
        </Box>
        {/* Guidelines */}
        <Box sx={{ textAlign: 'center', mt: 2, maxWidth: 400 }}>
          <Typography variant="caption" color="text.secondary">
            • Recommended size: 1200x400px<br />
            • Max file size: 5MB<br />
            • Supported formats: JPG, PNG<br />
            • Stored on Cloudinary
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
export default BannerUploadForm;