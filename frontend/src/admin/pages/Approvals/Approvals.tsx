import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { api } from '../../../Config/Api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Approvals = () => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'product' | 'offer'>('product');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch ALL products, then filter for pending, approved or rejected
      const res = await api.get('/admin/products');
      const allProducts = res.data.data || [];
      const filtered = allProducts.filter((p: any) => p.approvalStatus === 'PENDING' || p.approvalStatus === 'APPROVED' || p.approvalStatus === 'REJECTED');
      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/offers');
      const allOffers = res.data.data || [];
      const filtered = allOffers.filter((o: any) => o.offer.approvalStatus === 'PENDING' || o.offer.approvalStatus === 'APPROVED' || o.offer.approvalStatus === 'REJECTED');
      setOffers(filtered);
    } catch (error) {
      console.error('Error fetching offers', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) fetchProducts();
    else fetchOffers();
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = async (item: any, type: 'product' | 'offer') => {
    try {
      if (type === 'product') {
        await api.patch(`/admin/approvals/product/${item._id}`, { status: 'APPROVED' });
        fetchProducts();
      } else {
        await api.patch(`/admin/approvals/offer/${item.product._id}/variants/${item.variantId}/offers/${item.offer._id}`, { status: 'APPROVED' });
        fetchOffers();
      }
    } catch (error) {
      console.error('Error approving', error);
    }
  };

  const openRejectModal = (item: any, type: 'product' | 'offer') => {
    setSelectedItem(item);
    setItemType(type);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const openDetailsModal = (item: any, type: 'product' | 'offer') => {
    setSelectedItem(item);
    setItemType(type);
    setDetailsModalOpen(true);
  };

  const handleReject = async () => {
    try {
      if (itemType === 'product') {
        await api.patch(`/admin/approvals/product/${selectedItem._id}`, { status: 'REJECTED', rejectReason });
        fetchProducts();
      } else {
        await api.patch(`/admin/approvals/offer/${selectedItem.product._id}/variants/${selectedItem.variantId}/offers/${selectedItem.offer._id}`, { status: 'REJECTED', rejectReason });
        fetchOffers();
      }
      setRejectModalOpen(false);
    } catch (error) {
      console.error('Error rejecting', error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Product Approvals
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="approval tabs">
          <Tab label="All Products" />
          <Tab label="All Offers" />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
      ) : (
        <>
          <CustomTabPanel value={tabValue} index={0}>
            {products.length === 0 ? <Typography>No products found.</Typography> : (
              <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Seller</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((p: any) => (
                      <TableRow key={p._id} hover>
                        <TableCell>
                          {p.variants && p.variants[0] && p.variants[0].images && p.variants[0].images.length > 0 && (
                            <img src={p.variants[0].images[0]} alt={p.title} width={50} height={50} style={{ objectFit: 'contain', borderRadius: 4, cursor: 'pointer' }} onClick={() => openDetailsModal(p, 'product')} />
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.title}>{p.title}</TableCell>
                        <TableCell>{p.seller?.businessDetails?.businessName}</TableCell>
                        <TableCell>{p.category?.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={p.approvalStatus} 
                            size="small" 
                            color={p.approvalStatus === 'APPROVED' ? 'success' : p.approvalStatus === 'PENDING' ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button variant="outlined" size="small" onClick={() => openDetailsModal(p, 'product')} sx={{ mr: 1 }}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            {offers.length === 0 ? <Typography>No offers found.</Typography> : (
              <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Product Title</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Seller</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.map((o: any) => (
                      <TableRow key={o.offer._id} hover>
                        <TableCell>
                          {o.product.images && o.product.images[0] && (
                            <img src={o.product.images[0]} alt={o.product.title} width={50} height={50} style={{ objectFit: 'contain', borderRadius: 4, cursor: 'pointer' }} onClick={() => openDetailsModal(o, 'offer')} />
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.product.title}>{o.product.title}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">{o.color}</Typography>
                          {o.specifications && Object.keys(o.specifications).length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {Object.entries(o.specifications).map(([key, val]) => (
                                <Typography key={key} variant="caption" display="block" color="text.secondary">
                                  {key}: {String(val)}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{o.offer.seller?.businessDetails?.businessName}</TableCell>
                        <TableCell>₹{o.offer.sellingPrice}</TableCell>
                        <TableCell>
                          <Chip 
                            label={o.offer.approvalStatus} 
                            size="small" 
                            color={o.offer.approvalStatus === 'APPROVED' ? 'success' : o.offer.approvalStatus === 'PENDING' ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button variant="outlined" size="small" onClick={() => openDetailsModal(o, 'offer')} sx={{ mr: 1 }}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CustomTabPanel>
        </>
      )}

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{itemType === 'product' ? 'Product Details' : 'Offer Details'}</DialogTitle>
        <DialogContent dividers>
          {selectedItem && itemType === 'product' && (
            <Box>
              <Typography variant="h6">{selectedItem.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{selectedItem.description}</Typography>
              <Typography><strong>Seller:</strong> {selectedItem.seller?.businessDetails?.businessName}</Typography>
              <Typography><strong>Category:</strong> {selectedItem.category?.name}</Typography>
              <Typography><strong>Status:</strong> {selectedItem.approvalStatus}</Typography>
              
              <Typography variant="subtitle1" mt={2} fontWeight="bold">Variants & Specifications:</Typography>
              {selectedItem.variants?.map((v: any, i: number) => (
                <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography><strong>Color:</strong> {v.color}</Typography>
                  {v.specifications && Object.keys(v.specifications).length > 0 && (
                    <Typography><strong>Specs:</strong> {Object.entries(v.specifications).map(([key, val]) => `${key}: ${val}`).join(', ')}</Typography>
                  )}
                  <Box display="flex" gap={1} mt={1}>
                    {v.images?.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="variant" width={80} height={80} style={{ objectFit: 'contain', backgroundColor: '#f9fafb', borderRadius: '4px' }} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {selectedItem && itemType === 'offer' && (
            <Box>
              <Typography variant="h6">{selectedItem.product.title}</Typography>
              <Box display="flex" gap={1} mt={1} mb={2}>
                {selectedItem.product.images?.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="product" width={80} height={80} style={{ objectFit: 'contain', backgroundColor: '#f9fafb', borderRadius: '4px' }} />
                ))}
              </Box>
              <Typography><strong>Variant Color:</strong> {selectedItem.color}</Typography>
              <Typography><strong>Seller:</strong> {selectedItem.offer.seller?.businessDetails?.businessName}</Typography>
              <Typography><strong>SKU:</strong> {selectedItem.offer.sku}</Typography>
              
              <Typography mt={2}><strong>Selling Price:</strong> ₹{selectedItem.offer.sellingPrice}</Typography>
              <Typography><strong>MRP:</strong> ₹{selectedItem.offer.mrpPrice}</Typography>
              <Typography><strong>Stock:</strong> {selectedItem.offer.stock}</Typography>
              
              <Typography mt={2}><strong>Returnable:</strong> {selectedItem.offer.isReturnable ? `Yes (${selectedItem.offer.returnTAT})` : 'No'}</Typography>
              <Typography><strong>Replaceable:</strong> {selectedItem.offer.isReplaceable ? `Yes (${selectedItem.offer.replacementTAT})` : 'No'}</Typography>
              <Typography><strong>Delivery Charge:</strong> {selectedItem.offer.hasDeliveryCharge ? `₹${selectedItem.offer.deliveryChargePrice}` : 'Free'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
          {((itemType === 'product' && selectedItem?.approvalStatus !== 'APPROVED') || (itemType === 'offer')) && (
            <Button color="success" variant="contained" onClick={() => { setDetailsModalOpen(false); handleApprove(selectedItem, itemType); }}>Approve</Button>
          )}
          {((itemType === 'product' && selectedItem?.approvalStatus !== 'REJECTED') || (itemType === 'offer')) && (
            <Button color="error" variant="contained" onClick={() => { setDetailsModalOpen(false); openRejectModal(selectedItem, itemType); }}>Reject</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject {itemType === 'product' ? 'Product' : 'Offer'}</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Please provide a reason for rejecting this {itemType}.</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained" disabled={!rejectReason.trim()}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approvals;
