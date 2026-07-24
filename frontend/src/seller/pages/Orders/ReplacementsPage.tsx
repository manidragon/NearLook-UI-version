// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Orders\ReplacementsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert,
  Tab, Tabs, Badge, Grid, Divider
} from '@mui/material';
import {
  SwapHoriz, CheckCircle, Cancel, LocalShipping,
  Visibility, RateReview
} from '@mui/icons-material';

// ✅ CORRECTED IMPORTS: Added all new workflow thunks
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import {
  fetchSellerReplacements,
  approveReplacement,
  rejectReplacement,
  markOriginalReturned,
  completeReview,
  shipReplacement,
  markReplacementCompleted, 
  clearReplacementError
} from '../../../redux/Seller/ReplacementSlice';

const ReplacementsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // ✅ Safe selector with fallback
  const replacementState = useAppSelector((state: any) => state.replacements);
  const replacements = replacementState?.replacements || [];
  const loading = replacementState?.loading || false;
  const error = replacementState?.error || null;

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedReplacement, setSelectedReplacement] = useState<any>(null);
  
  // ✅ Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  
  // ✅ Form states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Fetch replacements on mount
  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || '';
    dispatch(fetchSellerReplacements(jwt));
  }, [dispatch]);

  // ✅ Filter replacements by status (Grouped logically for the 4 tabs)
  const pendingReplacements = replacements.filter((r: any) => r.status === 'PENDING');
  const inProgressReplacements = replacements.filter((r: any) => 
    ['APPROVED', 'ORIGINAL_RETURNED', 'REVIEW_COMPLETED'].includes(r.status)
  );
  const shippedReplacements = replacements.filter((r: any) => r.status === 'REPLACEMENT_SHIPPED');
  const completedReplacements = replacements.filter((r: any) => 
    ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)
  );

  // ============================================================================
  // ✅ HANDLERS
  // ============================================================================

  const handleApprove = async () => {
    if (!selectedReplacement) return;
    const jwt = localStorage.getItem('jwt') || '';
    try {
      await dispatch(approveReplacement({ returnId: selectedReplacement._id, jwt }));
      setApproveDialogOpen(false);
      setSelectedReplacement(null);
      dispatch(fetchSellerReplacements(jwt));
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedReplacement) return;
    const jwt = localStorage.getItem('jwt') || '';
    try {
      await dispatch(rejectReplacement({ 
        returnId: selectedReplacement._id, 
        reason: rejectReason || 'Rejected by seller', 
        jwt 
      }));
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedReplacement(null);
      dispatch(fetchSellerReplacements(jwt));
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const handleMarkOriginalReturned = async (returnId: string) => {
    const jwt = localStorage.getItem('jwt') || '';
    try {
      await dispatch(markOriginalReturned({ returnId, jwt }));
      dispatch(fetchSellerReplacements(jwt));
    } catch (err) {
      console.error('Failed to mark original returned:', err);
    }
  };

  const handleCompleteReview = async () => {
    if (!selectedReplacement) return;
    const jwt = localStorage.getItem('jwt') || '';
    try {
      await dispatch(completeReview({ 
        returnId: selectedReplacement._id, 
        reviewNotes, 
        jwt 
      }));
      setReviewDialogOpen(false);
      setReviewNotes('');
      setSelectedReplacement(null);
      dispatch(fetchSellerReplacements(jwt));
    } catch (err) {
      console.error('Failed to complete review:', err);
    }
  };

  const handleShipReplacement = async () => {
    if (!selectedReplacement) return;
    const jwt = localStorage.getItem('jwt') || '';
    try {
      await dispatch(shipReplacement({ 
        returnId: selectedReplacement._id, 
        trackingNumber, 
        jwt 
      }));
      setShipDialogOpen(false);
      setTrackingNumber('');
      setSelectedReplacement(null);
      dispatch(fetchSellerReplacements(jwt));
    } catch (err) {
      console.error('Failed to ship replacement:', err);
    }
  };

 const handleMarkCompleted = async (returnId: string) => {
  const jwt = localStorage.getItem('jwt') || '';
  try {
    await dispatch(markReplacementCompleted({ returnId, jwt }));
    dispatch(fetchSellerReplacements(jwt));  // Refresh list
    alert('Replacement marked as completed successfully!');
  } catch (error) {
    console.error('Failed to mark as completed:', error);
    alert('Failed to mark as completed');
  }
};

  // ✅ Helper to format status labels for the UI
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ORIGINAL_RETURNED': return 'Original Returned';
      case 'REVIEW_COMPLETED': return 'Review Completed';
      case 'REPLACEMENT_SHIPPED': return 'Shipped';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'ORIGINAL_RETURNED': return 'primary';
      case 'REVIEW_COMPLETED': return 'success';
      case 'REPLACEMENT_SHIPPED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SwapHoriz sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">Replacement Requests</Typography>
          <Typography variant="body2" color="text.secondary">Manage customer replacement requests</Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 3 }}>
          <Typography variant="h3" fontWeight="bold" color="warning.main">{pendingReplacements.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>Pending Approval</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 3 }}>
          <Typography variant="h3" fontWeight="bold" color="info.main">{inProgressReplacements.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>In Progress</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: 3 }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main">{shippedReplacements.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>Shipped</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3 }}>
          <Typography variant="h3" fontWeight="bold" color="success.main">{completedReplacements.length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>Completed</Typography>
        </Paper>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={selectedTab} 
        onChange={(e, val) => setSelectedTab(val)} 
        sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600 } }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label={<Badge badgeContent={pendingReplacements.length} color="warning">Pending</Badge>} />
        <Tab label={<Badge badgeContent={inProgressReplacements.length} color="info">In Progress</Badge>} />
        <Tab label={<Badge badgeContent={shippedReplacements.length} color="primary">Shipped</Badge>} />
        <Tab label={<Badge badgeContent={completedReplacements.length} color="success">Completed</Badge>} />
      </Tabs>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {replacementState?.successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearReplacementError())}>
          {replacementState.successMessage}
        </Alert>
      )}

      {/* Replacements Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ minWidth: 80, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Request ID</TableCell>
              <TableCell sx={{ minWidth: 140, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</TableCell>
              <TableCell sx={{ minWidth: 140, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Original Item</TableCell>
              <TableCell sx={{ minWidth: 140, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Replacement Variant</TableCell>
              <TableCell sx={{ minWidth: 100, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Reason</TableCell>
              <TableCell sx={{ minWidth: 110, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
              <TableCell sx={{ minWidth: 100, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Requested Date</TableCell>
              <TableCell align="right" sx={{ minWidth: 160, borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              const tabData = [pendingReplacements, inProgressReplacements, shippedReplacements, completedReplacements];
              const currentData = tabData[selectedTab] || [];

              if (currentData.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No replacement requests found</Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return currentData.map((replacement: any) => (
                <TableRow key={replacement._id} hover>
                  <TableCell><Typography variant="caption" fontWeight="bold">#{replacement._id.slice(-6)}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2">{replacement.customer?.fullName || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{replacement.customer?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{replacement.orderItem?.product?.title || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{replacement.orderItem?.size}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{replacement.replacementVariant?.color}</Typography>
                    {replacement.replacementVariant?.specifications && (
                      <Typography variant="caption" color="text.secondary">
                        {Object.entries(replacement.replacementVariant.specifications)
                          .map(([k, v]: [string, any]) => `${k}: ${v}`).join(', ')}
                      </Typography>
                    )}
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ₹{replacement.replacementVariant?.sellingPrice}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{replacement.reason}</Typography></TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(replacement.status)} color={getStatusColor(replacement.status) as any} size="small" />
                  </TableCell>
                  <TableCell><Typography variant="caption">{new Date(replacement.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* PENDING: Approve or Reject */}
                      {replacement.status === 'PENDING' && (
                        <>
                          <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                            onClick={() => { setSelectedReplacement(replacement); setApproveDialogOpen(true); }}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<Cancel />}
                            onClick={() => { setSelectedReplacement(replacement); setRejectDialogOpen(true); }}>
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {/* APPROVED: Mark Original Returned */}
                      {replacement.status === 'APPROVED' && (
                        <Button size="small" variant="contained" color="primary" startIcon={<LocalShipping />}
                          onClick={() => handleMarkOriginalReturned(replacement._id)}>
                          Mark Original Returned
                        </Button>
                      )}
                      
                      {/* ORIGINAL_RETURNED: Complete Review */}
                      {replacement.status === 'ORIGINAL_RETURNED' && (
                        <Button size="small" variant="contained" color="info" startIcon={<RateReview />} 
                          onClick={() => { setSelectedReplacement(replacement); setReviewDialogOpen(true); }}>
                          Complete Review
                        </Button>
                      )}
                      
                      {/* REVIEW_COMPLETED: Ship Replacement */}
                      {replacement.status === 'REVIEW_COMPLETED' && (
                        <Button size="small" variant="contained" color="success" startIcon={<LocalShipping />}
                          onClick={() => { setSelectedReplacement(replacement); setShipDialogOpen(true); }}>
                          Ship Replacement
                        </Button>
                      )}
                      
                      {/* REPLACEMENT_SHIPPED: Mark Delivered */}
                      {replacement.status === 'REPLACEMENT_SHIPPED' && (
                        <Button size="small" variant="contained" color="primary"
                          onClick={() => handleMarkCompleted(replacement._id)}>
                          Mark Delivered
                        </Button>
                      )}
                      
                      {/* View Details (always available) */}
                      <IconButton size="small" onClick={() => {
                        setSelectedReplacement(replacement);
                        setViewDetailsDialogOpen(true);
                      }} title="View Details">
                        <Visibility fontSize="small" color="primary" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ======================================================================== */}
      {/* ✅ DIALOGS */}
      {/* ======================================================================== */}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onClose={() => setViewDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility color="primary" />
            <Typography variant="h6" fontWeight="bold">Replacement Request Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
          {selectedReplacement && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Request Information */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  📋 Request Information
                </Typography>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Request ID</Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#0f172a', mt: 0.5 }}>#{selectedReplacement._id?.slice(-6) || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', mb: 0.5 }}>Status</Typography>
                      <Chip label={getStatusLabel(selectedReplacement.status)} size="small" color={getStatusColor(selectedReplacement.status) as any} sx={{ fontWeight: 'bold' }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Requested Date</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 500 }}>{new Date(selectedReplacement.createdAt).toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Reason</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 500 }}>{selectedReplacement.reason}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  📝 Description
                </Typography>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 3 }}>
                  <Typography variant="body1" sx={{ color: selectedReplacement?.description ? '#0369a1' : '#7dd3fc', fontStyle: selectedReplacement?.description ? 'normal' : 'italic' }}>
                    {selectedReplacement?.description ? selectedReplacement.description : 'No description provided by the customer.'}
                  </Typography>
                </Paper>
              </Box>

              {/* Proof Images */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  📸 Proof Images ({selectedReplacement?.images?.length || 0})
                </Typography>
                {selectedReplacement?.images && selectedReplacement.images.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedReplacement.images.map((img: string, idx: number) => (
                      <Grid key={idx} size={{ xs: 12, md: 4, sm: 6 }}>
                        <Paper elevation={0} sx={{ 
                          width: '100%', 
                          height: 240, 
                          borderRadius: 3, 
                          overflow: 'hidden', 
                          border: '1px solid #e2e8f0',
                          bgcolor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)' }
                        }}>
                          <img src={img} alt={`Proof ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                      No images uploaded for this request
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Customer Information */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  👤 Customer Information
                </Typography>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Name</Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#0f172a', mt: 0.5 }}>{selectedReplacement.customer?.fullName || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Email</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 500 }}>{selectedReplacement.customer?.email || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Mobile</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 500 }}>{selectedReplacement.customer?.mobile || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Pickup Address */}
              {selectedReplacement.order?.shippingAddress && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                    📍 Pickup Address
                  </Typography>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500 }}>{selectedReplacement.order.shippingAddress.address}</Typography>
                    <Typography variant="body1" sx={{ color: '#334155', mt: 0.5, fontWeight: 500 }}>{selectedReplacement.order.shippingAddress.city}, {selectedReplacement.order.shippingAddress.state}</Typography>
                    <Typography variant="body1" sx={{ color: '#0f172a', mt: 0.5, fontWeight: 'bold' }}>{selectedReplacement.order.shippingAddress.pinCode}</Typography>
                  </Paper>
                </Box>
              )}

              {/* Original Item */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  📦 Original Item
                </Typography>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#991b1b' }}>{selectedReplacement.orderItem?.product?.title || 'N/A'}</Typography>
                      <Typography variant="body2" sx={{ color: '#b91c1c', mt: 0.5, fontWeight: 500 }}>Variant: {selectedReplacement.orderItem?.size}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>MRP Price</Typography>
                      <Typography variant="body1" sx={{ color: '#991b1b', mt: 0.5, fontWeight: 'bold' }}>₹{selectedReplacement.orderItem?.mrpPrice}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Selling Price</Typography>
                      <Typography variant="body1" sx={{ color: '#991b1b', mt: 0.5, fontWeight: 'bold' }}>₹{selectedReplacement.orderItem?.sellingPrice}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Replacement Variant */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  🔄 Replacement Variant
                </Typography>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#166534' }}>{selectedReplacement.replacementVariant?.color}</Typography>
                      {selectedReplacement.replacementVariant?.specifications && (
                        <Typography variant="body2" sx={{ color: '#15803d', mt: 0.5, fontWeight: 500 }}>
                          {Object.entries(selectedReplacement.replacementVariant.specifications).map(([k, v]: [string, any]) => `${k}: ${v}`).join(', ')}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={{ color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Price</Typography>
                      <Typography variant="body1" sx={{ color: '#166534', mt: 0.5, fontWeight: 'bold' }}>₹{selectedReplacement.replacementVariant?.sellingPrice}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={{ color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Stock Available</Typography>
                      <Typography variant="body1" sx={{ color: '#166534', mt: 0.5, fontWeight: 'bold' }}>{selectedReplacement.replacementVariant?.stock}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Replacement Order */}
              {selectedReplacement.replacementOrder && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                    🛒 Replacement Order
                  </Typography>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Order ID</Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ color: '#3730a3', mt: 0.5 }}>#{selectedReplacement.replacementOrder._id?.slice(-6) || 'N/A'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', mb: 0.5 }}>Order Status</Typography>
                        <Chip label={selectedReplacement.replacementOrder.orderStatus} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', mb: 0.5 }}>Replacement Status</Typography>
                        <Chip label={getStatusLabel(selectedReplacement.replacementOrder.replacementStatus)} size="small" color={selectedReplacement.replacementOrder.replacementStatus === 'PENDING' ? 'warning' : 'success'} sx={{ fontWeight: 'bold' }} />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1, p: { xs: 2, sm: 1 }, '& > button': { m: '0 !important', width: { xs: '100%', sm: 'auto' } } }}>
          <Button onClick={() => setViewDetailsDialogOpen(false)} variant="outlined">Close</Button>
          {selectedReplacement?.status === 'PENDING' && (
            <>
              <Button onClick={() => { setViewDetailsDialogOpen(false); setApproveDialogOpen(true); }} variant="contained" color="success">Approve</Button>
              <Button onClick={() => { setViewDetailsDialogOpen(false); setRejectDialogOpen(true); }} variant="outlined" color="error">Reject</Button>
            </>
          )}
          {selectedReplacement?.status === 'APPROVED' && (
            <Button onClick={() => { setViewDetailsDialogOpen(false); handleMarkOriginalReturned(selectedReplacement._id); }} variant="contained" color="primary">Mark Original Returned</Button>
          )}
          {selectedReplacement?.status === 'ORIGINAL_RETURNED' && (
            <Button onClick={() => { setViewDetailsDialogOpen(false); setSelectedReplacement(selectedReplacement); setReviewDialogOpen(true); }} variant="contained" color="info">Complete Review</Button>
          )}
          {selectedReplacement?.status === 'REVIEW_COMPLETED' && (
            <Button onClick={() => { setViewDetailsDialogOpen(false); setSelectedReplacement(selectedReplacement); setShipDialogOpen(true); }} variant="contained" color="success">Ship Replacement</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Replacement Request</DialogTitle>
        <DialogContent>
          {selectedReplacement && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" mb={1}><strong>Customer:</strong> {selectedReplacement.customer?.fullName}</Typography>
              <Typography variant="body2" mb={1}><strong>Original Item:</strong> {selectedReplacement.orderItem?.product?.title}</Typography>
              <Typography variant="body2" mb={1}><strong>Replacement:</strong> {selectedReplacement.replacementVariant?.color} - ₹{selectedReplacement.replacementVariant?.sellingPrice}</Typography>
              <Typography variant="body2" mb={2}><strong>Reason:</strong> {selectedReplacement.reason}</Typography>
              <Alert severity="info">Approving this will create a replacement order and notify the customer to return the original item.</Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">Approve</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Replacement Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, width: 400 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              sx={{ mb: 2 }}
            />
            <Alert severity="warning">The customer will be notified that their replacement request has been rejected.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={!rejectReason.trim()}>Reject</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Review Returned Original Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, width: 400 }}>
            <Typography variant="body2" mb={2}>Verify that the returned original item matches the replacement request.</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review Notes (Optional)"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about the condition of the returned item..."
              sx={{ mb: 2 }}
            />
            <Alert severity="info">After completing the review, you'll be able to ship the replacement item.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteReview} variant="contained" color="success">Complete Review</Button>
        </DialogActions>
      </Dialog>

      {/* Ship Dialog */}
      <Dialog open={shipDialogOpen} onClose={() => setShipDialogOpen(false)}>
        <DialogTitle>Ship Replacement Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, width: 400 }}>
            <TextField
              fullWidth
              label="Tracking Number *"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter courier tracking number"
              sx={{ mb: 2 }}
            />
            <Alert severity="success">The replacement item will be shipped to the customer. Tracking information will be shared with them.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShipDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShipReplacement} variant="contained" color="primary">Confirm Shipment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReplacementsPage;