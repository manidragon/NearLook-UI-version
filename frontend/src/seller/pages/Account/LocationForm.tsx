// 📄 File: D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Account\LocationForm.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Alert, Snackbar, Typography } from '@mui/material'; // ✅ FIX 1: Added Typography import
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
// ✅ FIX 2: Correct casing + correct action name
import { updateSeller } from '../../../redux/Seller/sellerSlice'; // ← lowercase 's', and updateSeller
import CustomLoader from "../../../components/CustomLoader";

// ✅ Tamil Nadu districts (same as backend)
const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

interface LocationFormProps {
  onClose: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const sellers = useAppSelector((state: any) => state.sellers);
  const [district, setDistrict] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error'
  }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    if (sellers.profile) {
      setDistrict(sellers.profile.district || '');
      if (sellers.profile.location) {
        setAddress(sellers.profile.location.address || '');
        if (sellers.profile.location.coordinates && sellers.profile.location.coordinates.length === 2) {
          setCoordinates({
            lng: sellers.profile.location.coordinates[0],
            lat: sellers.profile.location.coordinates[1]
          });
        }
      }
    }
  }, [sellers.profile]);

  // ✅ Get current location via browser
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      setCoordinates({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save location to backend - FIXED: Allow district OR coordinates
  const handleSave = async () => {
    // ✅ Validation: At least ONE of district or coordinates must be set
    if (!district && !coordinates) {
      setError('Please select a district OR set your location coordinates');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Build payload with ONLY the fields that are set
      const updateData: any = {};
      
      if (district) {
        updateData.district = district;
      }
      
      if (coordinates || address) {
        // ✅ GeoJSON format: [longitude, latitude]
        updateData.location = {
          type: 'Point',
          coordinates: coordinates ? [coordinates.lng, coordinates.lat] : undefined,  // ✅ [lng, lat] for GeoJSON
          ...(address && { address: address.trim() })
        };
      }
      
      await dispatch(updateSeller(updateData)).unwrap();
      
      setSnackbar({ open: true, message: 'Location updated successfully!', severity: 'success' });
      setTimeout(onClose, 1500);
      
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update location', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" className="text-xl font-bold mb-4">📍 Set Business Location</Typography>
      
      {/* District Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel>District</InputLabel>
        <Select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          label="District"
        >
          <MenuItem value=""><em>None</em></MenuItem>  {/* ✅ Allow clearing district */}
          {TN_DISTRICTS.map((dist) => (
            <MenuItem key={dist} value={dist}>{dist}</MenuItem>
          ))}
        </Select>
        <FormHelperText>Select your business district (optional)</FormHelperText>
      </FormControl>

      {/* Current Location Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <Button
          variant="outlined"
          startIcon={loading ? <CustomLoader size={20} /> : <MyLocationIcon />}
          onClick={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? 'Detecting...' : '📍 Use Current Location'}
        </Button>
        {coordinates && (
          <Typography variant="body2" className="text-sm text-green-600">
            ✓ {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </Typography>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Optional Address */}
      <TextField
        fullWidth
        label="Location Address (Optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g., 123 Main St, Theni"
        margin="normal"
        helperText="Helps customers recognize your location"
      />



      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button onClick={onClose} variant="outlined" fullWidth disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          fullWidth 
          // ✅ FIXED: Enable if EITHER district OR coordinates OR address is set
          disabled={loading || (!district && !coordinates && !address)}
        >
          {loading ? 'Saving...' : 'Save Location'}
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationForm;