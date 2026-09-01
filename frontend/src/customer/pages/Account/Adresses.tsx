// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\Adresses.tsx
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { 
  fetchUserAddresses, 
  selectUserAddresses, 
  updateAddress, 
  deleteAddress,
  addAddress // ✅ Import addAddress
} from '../../../redux/Customer/UserSlice';
import UserAddressCard from './UserAddressCard';
import AddressForm from './AddressForm';
import { Typography, Alert, Box, Button, Snackbar } from '@mui/material';
import { type Address } from '../../../types/addressTypes';
import CustomLoader from "../../../components/CustomLoader";

const Addresses = () => {
  const dispatch = useAppDispatch();
  
  // ✅ Get addresses directly from UserSlice
  const addresses = useAppSelector(selectUserAddresses);
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);

  // ✅ State for editing/adding
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false); // ✅ Track if adding new
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (addresses.length === 0) {
      dispatch(fetchUserAddresses());
    }
  }, [dispatch, addresses.length]);

  // ✅ Handle Edit Click
  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsAdding(false);
  };

  // ✅ Handle Delete Click
  const handleDelete = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(addressId)).then((result) => {
        if (deleteAddress.fulfilled.match(result)) {
          setSnackbarMessage('Address deleted successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } else if (deleteAddress.rejected.match(result)) {
          setSnackbarMessage('Failed to delete address');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      });
    }
  };

  // ✅ Handle Form Submit (Add OR Update)
  const handleFormSubmit = (data: Omit<Address, '_id'> | Address) => {
    if (editingAddress && editingAddress._id) {
      // ✅ UPDATE existing address
      dispatch(updateAddress({
        id: editingAddress._id,
        data: data as Partial<Address>
      })).then((result) => {
        if (updateAddress.fulfilled.match(result)) {
          setSnackbarMessage('Address updated successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setEditingAddress(null);
          setIsAdding(false);
        } else if (updateAddress.rejected.match(result)) {
          setSnackbarMessage('Failed to update address');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      });
    } else {
      // ✅ ADD new address
      dispatch(addAddress(data as Omit<Address, '_id'>)).then((result) => {
        if (addAddress.fulfilled.match(result)) {
          setSnackbarMessage('Address added successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setEditingAddress(null);
          setIsAdding(false);
        } else if (addAddress.rejected.match(result)) {
          setSnackbarMessage('Failed to add address');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      });
    }
  };

  // ✅ Handle Cancel
  const handleCancel = () => {
    setEditingAddress(null);
    setIsAdding(false);
  };

  // ✅ Handle Add New Address Click
  const handleAddNewAddress = () => {
    setEditingAddress(null); // ✅ Clear editing state
    setIsAdding(true); // ✅ Set adding mode
  };

  // ✅ Handle Snackbar Close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className='flex justify-center items-center py-10'>
        <CustomLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className='my-4'>
        Failed to load addresses: {error}
      </Alert>
    );
  }

  return (
    <div className='space-y-3'>
      {/* ✅ Show Form for Add or Edit */}
      {(editingAddress || isAdding) && (
        <Box className="mb-6">
          <AddressForm 
            initialData={editingAddress || null} 
            onSubmit={handleFormSubmit} 
            onCancel={handleCancel} 
          />
        </Box>
      )}
      
      {/* ✅ Show Add Address Button */}
      {!editingAddress && !isAdding && (
        <Box className="mb-6">
          <Button
            variant="outlined"
            onClick={handleAddNewAddress}
            fullWidth
            sx={{ 
              py: 2, 
              border: '2px dashed #c24100', 
              color: '#c24100', 
              bgcolor: '#fff9f5',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '15px',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: '2px dashed #a33600',
                bgcolor: '#fff4ec',
                color: '#a33600'
              }
            }}
          >
            + Add New Address
          </Button>
        </Box>
      )}
      
      {/* ✅ Render Address Cards */}
      {addresses.length > 0 ? (
        addresses.map((address) => {
          // Hide the card if it's currently being edited
          if (editingAddress && editingAddress._id === address._id) {
            return null;
          }
          return (
            <UserAddressCard 
              key={address._id} 
              item={address} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        })
      ) : (
        <div className='text-center py-10'>
          <Typography color="text.secondary" variant="body1">
            No saved addresses.
          </Typography>
          <Typography color="text.secondary" variant="caption" className='mt-2 block'>
            Add your first address to get started
          </Typography>
        </div>
      )}

      {/* ✅ Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default Addresses;