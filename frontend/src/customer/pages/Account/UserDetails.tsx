// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\UserDetails.tsx
import { Divider, Button, TextField, Box, Avatar, IconButton, Alert, Snackbar } from '@mui/material';
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/PersonOutline";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateUserProfile, updateProfilePicture } from "../../../redux/Customer/UserSlice";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const UserDetails = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.user?.fullName || '');
  const [mobile, setMobile] = useState(user.user?.mobile || '');
  const [profilePicture, setProfilePicture] = useState(user.user?.profilePicture || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user.user) {
      setFullName(user.user.fullName);
      setMobile(user.user.mobile || '');
      setProfilePicture(user.user.profilePicture || '');
    }
  }, [user.user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName(user.user?.fullName || '');
    setMobile(user.user?.mobile || '');
    setProfilePicture(user.user?.profilePicture || '');
    setPreviewImage(null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const jwt = localStorage.getItem('jwt') || '';
      
      let imageUrl = profilePicture;
      if (selectedFile) {
        const uploadResult = await uploadToCloudinary(selectedFile);
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Failed to upload image");
        }
        imageUrl = uploadResult.url;
        setProfilePicture(imageUrl);
      }

      if (imageUrl !== user.user?.profilePicture) {
        await dispatch(updateProfilePicture({ 
          imageUrl, 
          jwt 
        })).unwrap();
      }

      // Update other profile fields
      await dispatch(updateUserProfile({ 
        fullName, 
        mobile: mobile || undefined, 
        jwt 
      })).unwrap();

      // Local success snackbar removed to avoid duplicates with global Profile.tsx snackbar
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error: any) {
      setSnackbarMessage(error || 'Failed to update profile');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle image selection and preview (only local)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
      setSnackbarMessage('Only JPEG, JPG, PNG, and WebP formats are supported');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      e.target.value = ''; // clear input
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSnackbarMessage('Image size must be less than 5MB');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      e.target.value = ''; // clear input
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    setProfilePicture('');
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getOptimizedImage = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_240,h_240,c_fill,q_auto,f_auto/');
    }
    return url;
  };

  return (
    <div className="p-4 lg:p-8 h-full bg-white lg:rounded-2xl">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-100 justify-between">
          <h1 className="text-[20px] lg:text-[24px] font-bold text-gray-900">
            Personal Information
          </h1>
          {!isEditing ? (
            <Button
              onClick={handleEditClick}
              size="small"
              sx={{ bgcolor: '#c24100', color: 'white', '&:hover': { bgcolor: '#a33600' }, borderRadius: 2, px: 2, textTransform: 'none', fontWeight: 600 }}
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCancel}
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'gray', borderColor: 'gray', flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="small"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ bgcolor: '#c24100', color: 'white', '&:hover': { bgcolor: '#a33600' }, borderRadius: 2, px: 2, textTransform: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-6">
            <div className="relative">
              <Avatar
                sx={{ 
                  width: { xs: 100, md: 120 }, 
                  height: { xs: 100, md: 120 },
                  bgcolor: '#fff4ec',
                  color: '#FF5A00',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '4px solid white'
                }}
                src={previewImage || getOptimizedImage(profilePicture) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user?.fullName || 'User')}&background=FF5A00&color=fff`}
                alt="Profile"
                imgProps={{ fetchPriority: 'high' as any, loading: 'eager' }}
              />
              {isEditing && (
                <div className="absolute bottom-2 right-2 bg-[#FF5A00] rounded-full p-1 border-2 border-white shadow-md">
                  <input
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-picture-upload">
                    <IconButton 
                      component="span" 
                      size="small"
                      sx={{ color: 'white', p: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1 sm:mt-4 text-center sm:text-left">
              {isEditing && (profilePicture || previewImage) && (
                <Button 
                  onClick={handleRemovePicture} 
                  variant="text" 
                  color="error"
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 600, width: 'fit-content', mx: { xs: 'auto', sm: 0 } }}
                >
                  Remove Picture
                </Button>
              )}
              {isEditing && (
                <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>
                  (Supported: JPEG, JPG, PNG, WebP. Max: 5MB)
                </span>
              )}
            </div>
          </div>

          <div>
            {isEditing ? (
              <Box className="space-y-6 pt-4">
                <TextField
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                />
                <Divider />
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user.user?.email}
                  disabled
                  helperText="Email cannot be changed"
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  variant="outlined"
                  size="small"
                />
              </Box>
            ) : (
              <div className="pt-2 space-y-4">
                
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
                    <PersonIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Full Name</p>
                    <p className="text-[14px] sm:text-[16px] text-gray-900 font-semibold break-words">{user.user?.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
                    <EmailIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="text-[14px] sm:text-[16px] text-gray-900 font-semibold break-all">{user.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF5A00] flex items-center justify-center flex-shrink-0">
                    <PhoneIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Mobile Number</p>
                    <p className="text-[14px] sm:text-[16px] text-gray-900 font-semibold break-words">{user.user?.mobile || 'Not provided'}</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDetails;