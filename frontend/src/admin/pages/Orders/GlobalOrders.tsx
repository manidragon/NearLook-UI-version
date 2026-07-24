import React, { useEffect, useState } from 'react';
import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Chip, useTheme, alpha, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { type Order } from '../../../types/orderTypes';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchAdminOrders } from '../../../redux/Admin/AdminOrderSlice';

const GlobalOrders = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { orders, loading } = useAppSelector(state => state.adminOrders);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
    };

    useEffect(() => {
        dispatch(fetchAdminOrders());
    }, [dispatch]);

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary">Global Orders</Typography>
                <Typography variant="body2" color="text.secondary">Track the lifecycle of all orders across the platform.</Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: '500' }}>{order._id}</TableCell>
                                    <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                                    <TableCell>{order.user?.fullName || 'Guest'}</TableCell>
                                    <TableCell>{order.totalItem}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{order.totalSellingPrice?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.paymentStatus} 
                                            size="small"
                                            color={order.paymentStatus === 'COMPLETED' ? 'success' : (order.paymentStatus === 'REFUNDED' ? 'error' : 'warning')}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.orderStatus} 
                                            size="small"
                                            color={order.orderStatus === 'DELIVERED' ? 'success' : (order.orderStatus === 'CANCELLED' ? 'error' : 'primary')}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleViewOrder(order)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    Order Details: {selectedOrder?._id}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedOrder && (
                        <Grid container spacing={3}>
                            {/* Customer & Order Info */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>Customer & Order Info</Typography>
                                <Typography variant="body2" mb={1}><strong>Customer:</strong> {selectedOrder.user?.fullName || 'Guest'} ({selectedOrder.user?.email || 'N/A'})</Typography>
                                <Typography variant="body2" mb={1}><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</Typography>
                                <Typography variant="body2" component="div" mb={1}>
                                    <strong>Status:</strong>{' '}
                                    <Chip 
                                        label={selectedOrder.orderStatus} 
                                        size="small"
                                        color={selectedOrder.orderStatus === 'DELIVERED' ? 'success' : (selectedOrder.orderStatus === 'CANCELLED' ? 'error' : 'primary')}
                                    />
                                </Typography>
                                <Typography variant="body2" component="div" mb={1}>
                                    <strong>Payment:</strong>{' '}
                                    <Chip 
                                        label={selectedOrder.paymentStatus} 
                                        size="small"
                                        color={selectedOrder.paymentStatus === 'COMPLETED' ? 'success' : (selectedOrder.paymentStatus === 'REFUNDED' ? 'error' : 'warning')}
                                        variant="outlined"
                                    />
                                </Typography>
                                <Typography variant="body2" mb={1}><strong>Fulfillment:</strong> {selectedOrder.fulfillmentType}</Typography>
                            </Grid>

                            {/* Seller & Shipping Info */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>Seller & Location Info</Typography>
                                <Typography variant="body2" mb={1}>
                                    <strong>Seller:</strong> {selectedOrder.seller?.sellerName || 'N/A'} 
                                    {selectedOrder.seller?.businessDetails?.businessName ? ` (${selectedOrder.seller.businessDetails.businessName})` : ''}
                                </Typography>
                                {selectedOrder.shippingAddress && (
                                    <>
                                        <Typography variant="body2" mb={1}><strong>Shipping Address:</strong></Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedOrder.shippingAddress.name}<br/>
                                            {selectedOrder.shippingAddress.address}<br/>
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}<br/>
                                            Mob: {selectedOrder.shippingAddress.mobile}
                                        </Typography>
                                    </>
                                )}
                            </Grid>

                            <Grid size={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight="bold" mb={2}>Order Items</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>MRP</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Selling Price</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.orderItems?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.product?.title || 'Unknown Product'}</TableCell>
                                                    <TableCell>{item.size || 'N/A'}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell align="right">₹{item.mrpPrice?.toFixed(2)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{item.sellingPrice?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>₹{selectedOrder.totalSellingPrice?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={handleCloseDialog} variant="contained" disableElevation>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GlobalOrders;
