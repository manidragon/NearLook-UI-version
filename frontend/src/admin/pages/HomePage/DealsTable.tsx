import { useEffect, useState } from 'react'
import { Box, IconButton, Modal, Snackbar, Typography } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { deleteDeal, getAllDeals } from '../../../redux/Admin/DealSlice';
import UpdateDealForm from './UpdateDealForm';
import Alert from "../../../components/CustomAlert";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '92%', sm: 450 },
  bgcolor: "background.paper",
  boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
  borderRadius: '24px',
  outline: 'none',
  p: { xs: 3, sm: 4 },
};

const DealsTable = () => {
    const deal = useAppSelector(state => state.deal);
    const [selectedDealId, setSelectedDealId] = useState<string | undefined>();
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const dispatch = useAppDispatch();

    const handleOpen = (id: string | undefined) => () => {
      setSelectedDealId(id);
      setOpen(true);
    };
    
    const handleClose = () => {
      setOpen(false);
      setSelectedDealId(undefined);
    };
    
    const handleDelete = (id: string) => async () => {
      if (window.confirm('Are you sure you want to delete this deal?')) {
        try {
          await dispatch(deleteDeal(id));
          setSnackbar({ open: true, message: 'Deal deleted successfully!', severity: 'success' });
          dispatch(getAllDeals());
        } catch (error) {
          setSnackbar({ open: true, message: 'Failed to delete deal', severity: 'error' });
        }
      }
    };

    const handleSnackbarClose = () => {
      setSnackbar({ ...snackbar, open: false });
    };
    
    useEffect(() => {
      dispatch(getAllDeals());
    }, [dispatch]);

    return (
      <Box className="w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-sm font-medium tracking-wide">
                  <th className="py-4 px-6 rounded-tl-3xl">No</th>
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6 text-right rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deal.deals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Box className="flex flex-col items-center justify-center opacity-60">
                        <LocalOfferIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" className="text-gray-500 font-medium">
                          No deals found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400 mt-1">
                          Click "Create Deal" to add your first promotional offer.
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                ) : (
                  deal.deals.map((item: any, index: number) => (
                    <tr 
                      key={item._id || item.id || index} 
                      className="group hover:bg-orange-50/30 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow duration-200">
                          <img 
                            className="w-full h-full object-cover" 
                            src={item.category?.image || '/placeholder-image.png'} 
                            alt={item.category?.name || 'Deal category'} 
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">
                          {item.category?.name || item.category?.description || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {item.discount}% OFF
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2 transition-opacity duration-200">
                          <IconButton 
                            onClick={handleOpen(item._id || item.id)} 
                            size="small" 
                            aria-label="Edit deal"
                            title="Edit deal"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={handleDelete(item._id || item.id)} 
                            size="small" 
                            aria-label="Delete deal"
                            title="Delete deal"
                            className="bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <UpdateDealForm deal={deal.deals.find((d: any) => d.id === selectedDealId || d._id === selectedDealId)} handleClose={handleClose} />
          </Box>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    )
}

export default DealsTable