import * as React from "react";
import Button from "../../../components/NeonButton";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import type { HomeCategory } from "../../../types/homeDataTypes";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import UpdateHomeCategoryForm from "./UpdateHomeCategoryForm";
import { useAppSelector, useAppDispatch } from "../../../redux/Store";
import { resetCategoryUpdated, deleteHomeCategory } from "../../../redux/Admin/AdminSlice";
import { getAllDeals } from "../../../redux/Admin/DealSlice";
import { secureUrl } from "../../../utils/secureUrl";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
  p: { xs: 2, sm: 4 },
  borderRadius: '24px',
  outline: 'none'
};

function HomeCategoryTable({categories, section}:{categories:HomeCategory[] | undefined, section: string}) {
  const [selectedCategory, setSelectedCategory] = React.useState<HomeCategory | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isCreateMode, setIsCreateMode] = React.useState(false);
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin);

  const handleOpen = (category: HomeCategory | null, createMode: boolean = false) => () => {
    setSelectedCategory(category);
    setIsCreateMode(createMode);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setIsCreateMode(false);
    if (adminState.categoryUpdated) {
      dispatch(resetCategoryUpdated());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteHomeCategory(id));
        if (section === 'DEALS') {
          dispatch(getAllDeals());
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <Box className="w-full">
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2 
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          className="font-bold text-gray-900 tracking-tight"
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.125rem' }, 
            textAlign: { xs: 'center', sm: 'left' },
            mb: 0
          }}
        >
          {section === 'GRID' ? 'Banner Grid Management' : 
           section === 'SHOP_BY_CATEGORY' ? 'Shop By Category Management' : 
           section === 'DEALS' ? 'Deals Categories' : 
           section}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen(null, true)}
          sx={{ 
            py: 1.5, 
            px: 3, 
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(to right, #f97316, #fb923c)',
            boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
            '&:hover': {
              background: 'linear-gradient(to right, #ea580c, #f97316)',
            }
          }}
        >
          Add New {section === 'DEALS' ? 'Category' : 'Banner'}
        </Button>
      </Box>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-sm font-medium tracking-wide">
                <th className="py-4 px-6 rounded-tl-3xl w-16">No</th>
                <th className="py-4 px-6 w-32">Image</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right rounded-tr-3xl w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!categories || categories.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Box className="flex flex-col items-center justify-center opacity-60">
                      <LocalOfferIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" className="text-gray-500 font-medium">
                        No {section === 'DEALS' ? 'categories' : 'banners'} found
                      </Typography>
                      <Typography variant="body2" className="text-gray-400 mt-1">
                        Click "Add New" to create your first entry.
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                categories.map((category: HomeCategory, index) => (
                  <tr 
                    key={category._id} 
                    className="group hover:bg-orange-50/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow duration-200 bg-gray-50 flex items-center justify-center">
                        {category.image ? (
                          <img 
                            className="w-full h-full object-cover" 
                            src={secureUrl(category.image)} 
                            alt={category.description || 'Category Image'} 
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-800">
                        {category.description || 'No description provided'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 transition-opacity duration-200">
                        <IconButton 
                          aria-label="Edit"
                          onClick={handleOpen(category)} 
                          size="small" 
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          aria-label="Delete"
                          onClick={() => handleDelete(category._id!)} 
                          size="small" 
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

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title">
        <Box sx={modalStyle}>
          <UpdateHomeCategoryForm
            category={selectedCategory}
            section={section}
            isCreateMode={isCreateMode}
            handleClose={handleClose}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default HomeCategoryTable;