// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Products\ProductTable.tsx
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, IconButton, styled, Chip, Tooltip, Collapse, Box, Typography, Divider, Alert, Snackbar, Tabs, Tab } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StoreIcon from '@mui/icons-material/Store';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import {
  fetchSellerProducts,
  updateProduct,
  deleteProduct,
  resetUpdateFlag,
  fetchSellerCatalogOffers  // ✅ NEW: Action to fetch catalog offers
} from '../../../redux/Seller/sellerProductSlice';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import UpdateProductForm from './UpdateProductForm';
import { type Product} from '../../../types/productTypes';
import type { Category } from '../../../types/categoryTypes';
import CustomLoader from "../../../components/CustomLoader";

// ============================================
// ✅ Styled Components
// ============================================
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.secondary,
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${theme.palette.grey[200]}`,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

// ============================================
// ✅ Tab Panel Component (for tab content)
// ============================================
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================
// ✅ Row Component Props
// ============================================
interface RowProps {
  row: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  getCategoryName: (categoryId: any) => string;
  isCatalogOffer?: boolean;
  onError?: (msg: string) => void;
}

// ============================================
// ✅ Row Component - Enhanced for Catalog Offers
// ============================================
function Row(props: RowProps) {
  const { row, onEdit, onDelete, getCategoryName, isCatalogOffer = false, onError } = props;
  const [open, setOpen] = React.useState(false);
  const [isFeatured, setIsFeatured] = React.useState(row.isFeatured || false);
  const dispatch = useAppDispatch();

  // ✅ Sync local state if Redux updates
  React.useEffect(() => {
    setIsFeatured(row.isFeatured || false);
  }, [row.isFeatured]);

  // ✅ Debug: Log product structure on mount
  React.useEffect(() => {
    if (open) {
      console.log('🔍 [Row Debug] Product data:', {
        title: row.title,
        variantsCount: row.variants?.length,
        isCatalogOffer,
        catalogId: row.catalog?._id || row.catalog,
        minPrice: row.minPrice,
        maxPrice: row.maxPrice
      });
    }
  }, [open, row, isCatalogOffer]);

  // ✅ Group variants by color
  const variantsByColor = React.useMemo(() => {
    if (!row.variants || !Array.isArray(row.variants) || row.variants.length === 0) {
      return {};
    }
    const grouped = row.variants.reduce((acc: Record<string, any>, variant: any) => {
      const color = variant?.color || 'Unknown';
      if (!acc[color]) acc[color] = [];
      acc[color].push(variant);
      return acc;
    }, {});
    return grouped;
  }, [row.variants]);

  // ✅✅✅ FIXED: Get price range - prioritize denormalized fields
  const priceRange = React.useMemo(() => {
    if (row.minPrice != null && row.maxPrice != null) {
      return { min: Number(row.minPrice), max: Number(row.maxPrice) };
    }
    if (!row.variants || !Array.isArray(row.variants)) {
      return { min: 0, max: 0 };
    }
    const allPrices: number[] = [];
    row.variants.forEach((variant: any) => {
      if (variant.offers && Array.isArray(variant.offers)) {
        variant.offers.forEach((offer: any) => {
          if (offer?.isActive !== false && offer?.sellingPrice != null) {
            allPrices.push(Number(offer.sellingPrice));
          }
        });
      } else if (variant?.sellingPrice != null && variant?.sellingPrice > 0) {
        allPrices.push(Number(variant.sellingPrice));
      }
    });
    return {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
    };
  }, [row.variants, row.minPrice, row.maxPrice]);

  // ✅ Get current seller ID for filtering
  const currentSellerId = React.useMemo(() => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return '';
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload._id || payload.userId || payload.id || payload.sellerId || '';
    } catch (e) {
      return '';
    }
  }, []);

  // ✅✅✅ FIXED: Get total stock ONLY for current seller
  const totalStock = React.useMemo(() => {
    if (!row.variants || !Array.isArray(row.variants)) return 0;
    return row.variants.reduce((sum: number, variant: any) => {
      if (variant.offers && Array.isArray(variant.offers)) {
        return sum + variant.offers.reduce((offerSum: number, offer: any) => {
          const offerSellerId = typeof offer.seller === 'string' ? offer.seller : offer.seller?._id || offer.seller?.$oid;
          if (offerSellerId !== currentSellerId) return offerSum;
          return offerSum + (Number(offer?.stock) || 0);
        }, 0);
      }
      return sum + (Number(variant?.stock) || 0);
    }, 0);
  }, [row.variants, currentSellerId]);

  // ✅✅✅ FIXED: Get best offer
  const getBestOffer = (variant: any) => {
    if (variant?.offers && Array.isArray(variant.offers)) {
      const activeOffers = variant.offers.filter((o: any) =>
        o?.isActive !== false && o?.sellingPrice != null && o?.sellingPrice > 0
      );
      if (activeOffers.length > 0) {
        return activeOffers.reduce((best: any, current: any) =>
          Number(current.sellingPrice) < Number(best.sellingPrice) ? current : best
        );
      }
    }
    if (variant?.sellingPrice != null && variant?.sellingPrice > 0) {
      return variant;
    }
    return null;
  };

  // ✅ Get variant selector specs ONLY
  const getVariantSelectorSpecs = (variant: any) => {
    if (!variant?.specifications) return {};
    const variantFields = ['ram', 'storage', 'size', 'color', 'weight', 'networktype'];
    const specs: Record<string, any> = {};
    Object.entries(variant.specifications).forEach(([key, value]) => {
      if (variantFields.includes(key.toLowerCase())) {
        specs[key] = value;
      }
    });
    return specs;
  };

  // ✅✅✅ FIXED: Count active offers correctly
  const countActiveOffers = (variant: any) => {
    if (!variant?.offers || !Array.isArray(variant.offers)) return 0;
    return variant.offers.filter((o: any) => o?.isActive !== false).length;
  };

  // ✅✅✅ FIXED: Get seller name safely
  const getSellerName = (offer: any) => {
    if (!offer?.seller) return 'Seller';
    if (offer.seller?.businessDetails?.businessName) return offer.seller.businessDetails.businessName;
    if (offer.seller?.sellerName) return offer.seller.sellerName;
    if (typeof offer.seller === 'string') return 'Seller';
    if (offer.seller?.$oid) return 'Seller';
    return 'Seller';
  };

  return (
    <React.Fragment>
      {/* ✅ Main Product Row */}
      <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <StyledTableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell component="th" scope="row">
          <div className='flex gap-1 flex-wrap'>
            {(row.variants?.[0]?.images || row.images || []).slice(0, 2).map((image: string, index: number) => (
              <img
                key={index}
                className='w-12 h-12 rounded-md object-cover border'
                src={image?.trim()}
                alt={`Product ${index + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                }}
              />
            ))}
          </div>
        </StyledTableCell>

        {/* ✅ Title Column */}
        <StyledTableCell align="left">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight="medium" className="max-w-[200px] truncate" title={row.title}>
              {row.title || 'N/A'}
            </Typography>
            {/* ✅ Badge for catalog offers */}
            {isCatalogOffer && (
              <Chip
                label="📦 Catalog"
                size="small"
                color="info"
                variant="outlined"
                icon={<StoreIcon fontSize="small" />}
              />
            )}
            {/* ✅ Badge for Product Approval */}
            {!isCatalogOffer && row.approvalStatus && (
              <Tooltip title={row.rejectReason || ''}>
                <Chip
                  label={row.approvalStatus}
                  size="small"
                  color={row.approvalStatus === 'APPROVED' ? 'success' : row.approvalStatus === 'REJECTED' ? 'error' : 'warning'}
                  variant="filled"
                  sx={{ ml: 1, fontSize: '10px', height: '20px' }}
                />
              </Tooltip>
            )}
          </Box>
        </StyledTableCell>

        {/* ✅ Category Column */}
        <StyledTableCell align="left">
          <Typography variant="body2" className="max-w-[150px] truncate" title={getCategoryName(row.category)}>
            {getCategoryName(row.category)}
          </Typography>
        </StyledTableCell>


        {/* ✅ Variants Column */}
        <StyledTableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
            <Chip
              label={`${Object.keys(variantsByColor).length} color${Object.keys(variantsByColor).length > 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              style={{ color: '#c24100', borderColor: '#c24100' }}
            />
            <Typography variant="caption" color="text.secondary">
              {row.variants?.length || 0} variant{row.variants?.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </StyledTableCell>

        {/* ✅ Stock Column */}
        <StyledTableCell align="center">
          <Chip
            label={totalStock > 0 ? `${totalStock}` : '0'}
            size="small"
            color={totalStock > 0 ? 'success' : 'error'}
            variant={totalStock > 0 ? 'filled' : 'outlined'}
          />
        </StyledTableCell>

        {/* ✅ Actions Column */}
        <StyledTableCell align="center">
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title={isCatalogOffer ? "Update Offer" : "Edit Product"}>
              <IconButton color='primary' onClick={() => onEdit(row)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isCatalogOffer && (
              <Tooltip title={isFeatured ? "Remove from Featured" : "Add to Featured"}>
                <IconButton 
                  color={isFeatured ? "warning" : "default"} 
                  onClick={() => {
                    const newStatus = !isFeatured;
                    setIsFeatured(newStatus); // Optimistic UI update

                    dispatch(updateProduct({
                      productId: row._id!,
                      product: { isFeatured: newStatus } as any
                    })).unwrap()
                    .catch((err: any) => {
                      setIsFeatured(!newStatus); // Revert on failure
                      if (onError) onError(err.message || err || 'Failed to update featured status');
                    });
                  }} 
                  size="small"
                >
                  {isFeatured ? <StarIcon fontSize="small" sx={{ color: '#ffb400' }} /> : <StarBorderIcon fontSize="small" sx={{ color: '#ffb400' }} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </StyledTableCell>
      </StyledTableRow>

      {/* ✅ Expanded Row: Variant & Offer Details */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="div" fontWeight="700" color="primary.main">
                  🎨 Variant & Offer Details
                </Typography>
                {isCatalogOffer && (
                  <Chip
                    label="📦 Shared Catalog Product"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              {Object.entries(variantsByColor).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No variants available</Typography>
              ) : (
                Object.entries(variantsByColor).map(([color, colorVariants]: [string, any[]]) => (
                  <Box key={color} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip label={color} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600 }} />
                      <Typography variant="body2" color="text.secondary">
                        {colorVariants.length} option{colorVariants.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* ✅✅✅ FIXED: Show Seller Offers PER SUB-VARIANT - minimal change, keeps your working code */}
                    {open && (
                      <Box sx={{ mt: 3 }}>
                        {/* ✅ Loop through EACH sub-variant - but keep YOUR exact inner rendering */}
                        {colorVariants.map((variant: any, variantIdx: number) => {
                          const currentSellerId = (() => {
                            try {
                              const jwt = localStorage.getItem('jwt');
                              if (!jwt) return null;
                              const payload = JSON.parse(atob(jwt.split('.')[1]));
                              return payload._id || payload.userId || payload.id || payload.sellerId;
                            } catch { return null; }
                          })();

                          // ✅ Filter ONLY your active offers
                          const allOffers = variant.offers || [];
                          const yourOffersList = allOffers.filter((offer: any) => {
                            const offerSellerId = offer.seller?._id || offer.seller;
                            return offerSellerId === currentSellerId;
                          });
                          const yourOffer = yourOffersList[0]; // Get your first offer

                          // ✅ Debug log (remove after testing)
                          console.log(`🔍 [Variant ${variantIdx}]`, {
                            variantId: variant._id,
                            totalOffers: allOffers.length,  // ✅ Updated to new variable name
                            yourOffersCount: yourOffersList.length,
                            currentSellerId,
                            yourOffer
                          });

                          return (
                            <Paper
                              key={variant._id?.$oid || variant._id || `variant-${variantIdx}`}
                              elevation={0}
                              sx={{
                                mb: 1.5,
                                p: 2,
                                border: '1px solid',
                                borderColor: yourOffer ? 'success.200' : 'grey.200',
                                borderRadius: 3,
                                bgcolor: yourOffer ? '#f8fafc' : '#ffffff',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: yourOffer ? 'success.main' : 'primary.200',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                {/* Variant Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight="700" color="text.secondary">
                                      Variant {variantIdx + 1}
                                    </Typography>
                                  </Box>
                                  <Chip label={variant.specifications?.ram || 'N/A'} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                                  <Chip label={variant.specifications?.storage || 'N/A'} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                                </Box>

                                {/* Offer Details or Empty State */}
                                {yourOffer ? (
                                  <>
                                    <Box sx={{ textAlign: 'right', minWidth: '100px' }}>
                                      <Typography variant="caption" color="text.secondary" className="line-through" sx={{ display: 'block', mb: -0.5 }}>
                                        MRP: ₹{Number(yourOffer.mrpPrice).toFixed(2)}
                                      </Typography>
                                      <Typography variant="body1" fontWeight="800" color="success.main">
                                        ₹{Number(yourOffer.sellingPrice).toFixed(2)}
                                      </Typography>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                                    <Chip
                                      icon={<StoreIcon fontSize="small" />}
                                      label={`${yourOffer.stock || 0} in stock`}
                                      size="small"
                                      color={yourOffer.stock > 0 ? 'success' : 'error'}
                                      variant={yourOffer.stock > 0 ? "filled" : "outlined"}
                                      sx={{ fontWeight: 600 }}
                                    />

                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                                      SKU: {yourOffer.sku || 'N/A'}
                                    </Typography>

                                    {/* ✅ Badge for Offer Approval */}
                                    {yourOffer.approvalStatus && (
                                      <Tooltip title={yourOffer.rejectReason || ''}>
                                        <Chip
                                          label={yourOffer.approvalStatus}
                                          size="small"
                                          color={yourOffer.approvalStatus === 'APPROVED' ? 'success' : yourOffer.approvalStatus === 'REJECTED' ? 'error' : 'warning'}
                                          variant="filled"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      </Tooltip>
                                    )}

                                    <Chip
                                      label={yourOffer.isActive !== false ? "Active" : "Inactive"}
                                      size="small"
                                      color={yourOffer.isActive !== false ? "success" : "default"}
                                      variant="outlined"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', px: 2, py: 1, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    No offer added
                                  </Typography>
                                )}
                              </Box>
                              
                              {/* ✅ Explicit Reject Reason display */}
                              {yourOffer && yourOffer.approvalStatus === 'REJECTED' && yourOffer.rejectReason && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                                  <Typography variant="body2" color="error.dark">
                                    <strong>Rejection Reason:</strong> {yourOffer.rejectReason}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          );
                        })}
                      </Box>
                    )}

                    {Object.keys(variantsByColor).length > 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// ============================================
// ✅ MAIN COMPONENT: ProductTable with Tabs
// ============================================
export default function ProductTable() {
  const sellerProduct = useAppSelector(state => state.sellerProduct);
  const categoryState = useAppSelector(state => state.category);
  const dispatch = useAppDispatch();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  // ✅ NEW: Tab state
  const [activeTab, setActiveTab] = React.useState(0);

  // ✅ Fetch both independent products AND catalog offers on mount
  React.useEffect(() => {
    const jwt = localStorage.getItem("jwt") || "";
    if (jwt) {
      dispatch(fetchSellerProducts(jwt));
      dispatch(fetchSellerCatalogOffers(jwt));  // ✅ Fetch catalog offers too
    }
  }, [dispatch]);

  // ✅ Handle snackbar for both product types - NO REFETCH NEEDED
  React.useEffect(() => {
    if (sellerProduct.productUpdated && !sellerProduct.loading) {
      setSnackbarMessage('✅ Product updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // ✅ Redux already merged the updated product - no refetch needed!
      dispatch(resetUpdateFlag());

      if (editDialogOpen) {
        setTimeout(() => {
          setEditDialogOpen(false);
          setEditProduct(null);
        }, 500);
      }
    }
    if (sellerProduct.error && !sellerProduct.loading) {
      const errorMsg = typeof sellerProduct.error === 'string'
        ? sellerProduct.error
        : (sellerProduct.error as any)?.message || 'Update failed';
      setSnackbarMessage(`❌ ${errorMsg}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [sellerProduct.productUpdated, sellerProduct.error, sellerProduct.loading, dispatch, editDialogOpen]);

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditProduct(null);
  };

  const handleDeleteClick = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };

  const getCategoryName = (categoryId: string | { _id: string; name?: string } | undefined): string => {
    if (!categoryId) return 'N/A';
    if (typeof categoryId === 'object' && 'name' in categoryId && categoryId.name) return categoryId.name;
    const id = typeof categoryId === 'string' ? categoryId : categoryId._id;
    const category = categoryState.categories?.find((cat: Category) => cat._id === id);
    return category?.name || 'Unknown';
  };

  // ✅ Separate products by type
  const getCurrentSellerId = () => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return null;
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload._id || payload.userId || payload.id || payload.sellerId;
    } catch {
      return null;
    }
  };

  const currentSellerId = getCurrentSellerId();
  const allProducts = Array.isArray(sellerProduct.products) ? sellerProduct.products : [];

  // ✅✅✅ FIXED: Filter by seller's offers in variants[].offers[], not by catalog field
  // ✅✅✅ CORRECTED: Separate by ownership, not catalog field
  const myProducts = allProducts.filter((p: Product) => {
    // ✅ My Products: I am the OWNER (I created this product)
    const isOwner = p.seller === currentSellerId || p.seller?._id === currentSellerId;
    return isOwner;
  });

  const catalogOffers = allProducts.filter((p: Product) => {
    // ✅ Catalog Offers: I added offers to OTHER SELLERS' products
    const isOwner = p.seller === currentSellerId || p.seller?._id === currentSellerId;
    const hasMyOffers = p.variants?.some((v: any) =>
      v.offers?.some((o: any) => {
        const offerSellerId = o.seller?._id || o.seller;
        return offerSellerId === currentSellerId && o.isActive !== false;
      })
    );

    // ✅ Show in catalog offers if: NOT owner BUT has my offers
    return !isOwner && hasMyOffers;
  });

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      {/* ✅ Header with Tabs */}
      {/* ✅ Header with Tabs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Products</Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              Manage your independent products and catalog offers
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/seller/add-product'}
            startIcon={<AddPhotoAlternateIcon />}
            sx={{ whiteSpace: 'nowrap', bgcolor: '#c24100', '&:hover': { bgcolor: '#9e3400' } }}
          >
            Add New
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              '& .MuiTab-root': { fontWeight: 600 },
              '& .Mui-selected': { color: '#c24100 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#c24100' }
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={activeTab === 0 ? 'bold' : 'normal'}>
                    🛍️ My Products
                  </Typography>
                  <Chip label={myProducts.length} size="small" variant="outlined" style={{ color: '#c24100', borderColor: '#c24100' }} />
                </Box>
              }
              id="product-tab-0"
              aria-controls="product-tabpanel-0"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={activeTab === 1 ? 'bold' : 'normal'}>
                    📦 Catalog Offers
                  </Typography>
                  <Chip label={catalogOffers.length} size="small" variant="outlined" style={{ color: '#1565C0', borderColor: '#1565C0' }} />
                </Box>
              }
              id="product-tab-1"
              aria-controls="product-tabpanel-1"
            />
          </Tabs>
        </Box>
      </Box>

      {sellerProduct.loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CustomLoader />
        </Box>
      )}

      {sellerProduct.error && !sellerProduct.loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {
            (() => {
              const err = sellerProduct.error;
              if (typeof err === 'string') return err;
              if (!err) return 'Unknown error';
              const errorObj = err as { message?: string; errors?: string[];[key: string]: any };
              if (errorObj.message) return String(errorObj.message);
              if (errorObj.errors && Array.isArray(errorObj.errors)) return errorObj.errors.join(', ');
              return JSON.stringify(err);
            })()
          }
          <Button
            size="small"
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => {
              const jwt = localStorage.getItem("jwt") || "";
              if (jwt) {
                dispatch(fetchSellerProducts(jwt));
                dispatch(fetchSellerCatalogOffers(jwt));
              }
            }}
          >
            Retry
          </Button>
        </Alert>
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ✅ Tab Panels */}
      {!sellerProduct.loading && !sellerProduct.error && (
        <>
          {/* Tab 0: Independent Products */}
          <TabPanel value={activeTab} index={0}>
            {myProducts.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first product to start selling
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.href = '/seller/add-product'}
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  Create Product
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1000 }} aria-label="my products table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell />
                      <StyledTableCell>Images</StyledTableCell>
                      <StyledTableCell align="left">Title</StyledTableCell>
                      <StyledTableCell align="left">Category</StyledTableCell>
                      <StyledTableCell align="center">Variants</StyledTableCell>
                      <StyledTableCell align="center">Stock</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myProducts.map((item: Product) => (
                      <Row
                        key={item._id}
                        row={item}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        getCategoryName={getCategoryName}
                        isCatalogOffer={false}
                        onError={(msg) => { setSnackbarMessage(msg); setSnackbarSeverity('error'); setSnackbarOpen(true); }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Tab 1: Catalog Offers */}
          <TabPanel value={activeTab} index={1}>
            {catalogOffers.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No catalog offers found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  List your offer on existing catalog products to start selling
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.href = '/seller/add-product'}
                  startIcon={<StoreIcon />}
                >
                  List Catalog Offer
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1000 }} aria-label="catalog offers table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell />
                      <StyledTableCell>Images</StyledTableCell>
                      <StyledTableCell align="left">Title</StyledTableCell>
                      <StyledTableCell align="left">Category</StyledTableCell>
                      <StyledTableCell align="center">Variants</StyledTableCell>
                      <StyledTableCell align="center">Stock</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catalogOffers.map((item: Product) => (
                      <Row
                        key={item._id}
                        row={item}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        getCategoryName={getCategoryName}
                        isCatalogOffer={true}
                        onError={(msg) => { setSnackbarMessage(msg); setSnackbarSeverity('error'); setSnackbarOpen(true); }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </>
      )}

      {/* ✅ Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 }, width: { xs: 'calc(100% - 16px)', sm: '100%' } } }}
      >
        {editProduct && (
          <UpdateProductForm
            initialValues={editProduct as any}
            onClose={handleEditDialogClose}
          />
        )}
      </Dialog>
    </>
  );
}