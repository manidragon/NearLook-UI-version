import { useEffect, useState } from 'react';
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
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#111827' }}>Global Orders</Typography>
                <Typography variant="body2" sx={{ color: '#4B5563' }}>Track the lifecycle of all orders across the platform.</Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Order ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Items</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }} align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: '500', color: '#111827' }}>{order._id}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{new Date(order.orderDate).toLocaleString()}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{order.user?.fullName || 'Guest'}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{order.totalItem}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#111827' }}>₹{order.totalSellingPrice?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.paymentStatus} 
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: order.paymentStatus === 'COMPLETED' ? '#064E3B' : (order.paymentStatus === 'REFUNDED' ? '#7F1D1D' : '#78350F'),
                                                bgcolor: order.paymentStatus === 'COMPLETED' ? '#D1FAE5' : (order.paymentStatus === 'REFUNDED' ? '#FEE2E2' : '#FEF3C7'),
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.orderStatus} 
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: order.orderStatus === 'DELIVERED' ? '#064E3B' : (order.orderStatus === 'CANCELLED' ? '#7F1D1D' : '#1E3A8A'),
                                                bgcolor: order.orderStatus === 'DELIVERED' ? '#D1FAE5' : (order.orderStatus === 'CANCELLED' ? '#FEE2E2' : '#DBEAFE'),
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton sx={{ color: '#C2410C' }} onClick={() => handleViewOrder(order)} aria-label={`View order ${order._id}`}>
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
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#111827' }} mb={2}>Customer & Order Info</Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} mb={1}><strong>Customer:</strong> {selectedOrder.user?.fullName || 'Guest'} ({selectedOrder.user?.email || 'N/A'})</Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} mb={1}><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} component="div" mb={1}>
                                    <strong>Status:</strong>{' '}
                                    <Chip 
                                        label={selectedOrder.orderStatus} 
                                        size="small"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: selectedOrder.orderStatus === 'DELIVERED' ? '#064E3B' : (selectedOrder.orderStatus === 'CANCELLED' ? '#7F1D1D' : '#1E3A8A'),
                                            bgcolor: selectedOrder.orderStatus === 'DELIVERED' ? '#D1FAE5' : (selectedOrder.orderStatus === 'CANCELLED' ? '#FEE2E2' : '#DBEAFE'),
                                        }}
                                    />
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} component="div" mb={1}>
                                    <strong>Payment:</strong>{' '}
                                    <Chip 
                                        label={selectedOrder.paymentStatus} 
                                        size="small"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: selectedOrder.paymentStatus === 'COMPLETED' ? '#064E3B' : (selectedOrder.paymentStatus === 'REFUNDED' ? '#7F1D1D' : '#78350F'),
                                            bgcolor: selectedOrder.paymentStatus === 'COMPLETED' ? '#D1FAE5' : (selectedOrder.paymentStatus === 'REFUNDED' ? '#FEE2E2' : '#FEF3C7'),
                                        }}
                                    />
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} mb={1}><strong>Fulfillment:</strong> {selectedOrder.fulfillmentType}</Typography>
                            </Grid>

                            {/* Seller & Shipping Info */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#111827' }} mb={2}>Seller & Location Info</Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }} mb={1}>
                                    <strong>Seller:</strong> {selectedOrder.seller?.sellerName || 'N/A'} 
                                    {selectedOrder.seller?.businessDetails?.businessName ? ` (${selectedOrder.seller.businessDetails.businessName})` : ''}
                                </Typography>
                                {selectedOrder.shippingAddress && (
                                    <>
                                        <Typography variant="body2" sx={{ color: '#374151' }} mb={1}><strong>Shipping Address:</strong></Typography>
                                        <Typography variant="body2" sx={{ color: '#4B5563' }}>
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
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#111827' }} mb={2}>Order Items</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Product</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Size</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Quantity</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#111827' }}>MRP</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#111827' }}>Selling Price</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.orderItems?.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ color: '#374151' }}>{item.product?.title || 'Unknown Product'}</TableCell>
                                                    <TableCell sx={{ color: '#374151' }}>{item.size || 'N/A'}</TableCell>
                                                    <TableCell sx={{ color: '#374151' }}>{item.quantity}</TableCell>
                                                    <TableCell align="right" sx={{ color: '#374151' }}>₹{item.mrpPrice?.toFixed(2)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#111827' }}>₹{item.sellingPrice?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold', color: '#111827' }}>Total</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#C2410C' }}>₹{selectedOrder.totalSellingPrice?.toFixed(2)}</TableCell>
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
