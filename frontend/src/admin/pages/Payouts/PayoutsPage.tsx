import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Card, useMediaQuery, useTheme, Tabs, Tab, Checkbox, Snackbar, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchAllTransactions, triggerPayouts } from "../../../redux/Admin/AdminPayoutSlice";
// Removed PayoutDetails import since we are using inline TransactionGroupDetails
import CustomLoader from "../../../components/CustomLoader";

const PayoutsPage = () => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { transactions, loading } = useAppSelector((state) => state.adminPayouts);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

    useEffect(() => {
        dispatch(fetchAllTransactions());
    }, [dispatch]);

    const handleViewDetails = (sellerId: string) => {
        setSelectedSellerId(sellerId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSellerId(null);
    };

    const handleTriggerPayouts = async () => {
        if (selectedSellers.length === 0) {
            setSnackbarMsg("Please select at least one seller to generate payouts.");
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }
        setTriggerLoading(true);
        try {
            await dispatch(triggerPayouts(selectedSellers)).unwrap();
            dispatch(fetchAllTransactions());
            setSelectedSellers([]);
            setSnackbarMsg("Successfully triggered payout generation!");
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMsg(`Failed to trigger payouts: ${error}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setTriggerLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const filteredTransactions = transactions.filter(t => {
        const isCompletedOnline = t.paymentStatus === 'COMPLETED' && !t.isOffline && t.paymentMethod !== 'CASH_ON_DELIVERY';
        if (tabIndex === 0) {
            // Pending tab: Only show unsettled transactions where order is actually DELIVERED
            return !t.isSettled && isCompletedOnline && (t as any).order?.orderStatus === 'DELIVERED';
        } else {
            // Settled tab: Show all settled transactions
            return t.isSettled && isCompletedOnline;
        }
    });

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, any> = {};
        filteredTransactions.forEach(tx => {
            const sellerId = tx.seller?._id || "unknown";
            const sellerName = tx.seller?.sellerName || "N/A";
            
            if (!groups[sellerId]) {
                groups[sellerId] = {
                    sellerId,
                    sellerName,
                    noOfOrders: 0,
                    totalAmount: 0
                };
            }
            
            groups[sellerId].noOfOrders += 1;
            groups[sellerId].totalAmount += (tx.netAmount || 0);
        });
        return Object.values(groups);
    }, [filteredTransactions]);

    const selectedSellerTransactions = useMemo(() => {
        if (!selectedSellerId) return [];
        return filteredTransactions.filter(tx => tx.seller?._id === selectedSellerId);
    }, [filteredTransactions, selectedSellerId]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedSellers(groupedTransactions.map(g => g.sellerId));
        } else {
            setSelectedSellers([]);
        }
    };

    const handleSelectOne = (event: React.ChangeEvent<HTMLInputElement>, sellerId: string) => {
        if (event.target.checked) {
            setSelectedSellers(prev => [...prev, sellerId]);
        } else {
            setSelectedSellers(prev => prev.filter(id => id !== sellerId));
        }
    };

    const isAllSelected = groupedTransactions.length > 0 && selectedSellers.length === groupedTransactions.length;
    const isIndeterminate = selectedSellers.length > 0 && selectedSellers.length < groupedTransactions.length;

    return (
        <Box className="w-full min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <Typography variant="h4" className="font-bold text-gray-900 flex items-center gap-2">
                        <AccountBalanceWalletIcon fontSize="large" sx={{ color: '#C2410C' }} />
                        Seller Transactions & Payouts
                    </Typography>
                    <Typography variant="body2" className="text-gray-700 mt-1">
                        Manage and track seller settlements and transactions
                    </Typography>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="outlined"
                        color="inherit"
                        aria-label="Refresh transactions"
                        onClick={() => dispatch(fetchAllTransactions())}
                        disabled={loading}
                        className="bg-white hover:bg-gray-50 flex-shrink-0 border-gray-300"
                        sx={{ minWidth: isMobile ? 'auto' : '100px', p: isMobile ? '8px' : undefined }}
                    >
                        {isMobile ? <RefreshIcon /> : <><RefreshIcon className="mr-2" fontSize="small" /> Refresh</>}
                    </Button>
                    {tabIndex === 0 && (
                        <Button 
                            variant="contained" 
                            onClick={handleTriggerPayouts}
                            disabled={triggerLoading || selectedSellers.length === 0}
                            className="bg-gradient-to-r from-[#FF5A00] to-[#ff7a33] text-white shadow-md hover:shadow-lg w-full sm:w-auto"
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1
                            }}
                        >
                            {triggerLoading ? <CustomLoader size={24} color="inherit" /> : "Generate Payouts"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={tabIndex} 
                    onChange={handleTabChange} 
                    aria-label="transaction tabs"
                    sx={{
                        '& .MuiTab-root.Mui-selected': {
                            color: '#111827',
                            fontWeight: 'bold'
                        },
                        '& .MuiTab-root': {
                            color: '#4B5563'
                        }
                    }}
                >
                    <Tab label="Pending Settlement Transactions" />
                    <Tab label="Settled Transactions" />
                </Tabs>
            </Box>

            {/* Table Section */}
            <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
                <TableContainer className="custom-scrollbar">
                    <Table sx={{ minWidth: 650 }} aria-label="transactions table">
                        <TableHead className="bg-gray-50/80 border-b border-gray-100">
                            <TableRow>
                                {tabIndex === 0 && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={isIndeterminate}
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            inputProps={{ 'aria-label': 'Select all sellers' }}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="font-semibold text-gray-900">Seller Name</TableCell>
                                <TableCell align="center" className="font-semibold text-gray-900">No. of Orders</TableCell>
                                <TableCell align="right" className="font-semibold text-gray-900">Total Amount (₹)</TableCell>
                                <TableCell align="center" className="font-semibold text-gray-900">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={tabIndex === 0 ? 5 : 4} align="center" className="py-20">
                                        <CustomLoader size={40} className="text-[#FF5A00]" />
                                    </TableCell>
                                </TableRow>
                            ) : groupedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={tabIndex === 0 ? 5 : 4} align="center" className="py-16">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <AccountBalanceWalletIcon sx={{ fontSize: 60, opacity: 0.3 }} className="mb-4" />
                                            <Typography variant="h5" className="text-gray-700 font-medium">No transactions found</Typography>
                                            {tabIndex === 0 && <Typography variant="body2" className="mt-1 text-gray-700">Click "Generate Payouts" to process pending settlements.</Typography>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groupedTransactions.map((group: any) => (
                                    <TableRow
                                        key={group.sellerId}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s' }}
                                    >
                                        {tabIndex === 0 && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={selectedSellers.includes(group.sellerId)}
                                                    onChange={(e) => handleSelectOne(e, group.sellerId)}
                                                    inputProps={{ 'aria-label': `Select seller ${group.sellerName}` }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell component="th" scope="row" className="font-medium text-gray-900">
                                            {group.sellerName}
                                        </TableCell>
                                        <TableCell align="center" className="text-gray-800 font-medium">
                                            {group.noOfOrders}
                                        </TableCell>
                                        <TableCell align="right" className="font-bold text-gray-900">
                                            ₹{group.totalAmount?.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="text" 
                                                size="small"
                                                onClick={() => handleViewDetails(group.sellerId)}
                                                className="text-[#FF5A00] hover:bg-orange-50 font-medium rounded-lg"
                                                startIcon={!isMobile && <VisibilityIcon />}
                                            >
                                                {isMobile ? <VisibilityIcon fontSize="small" /> : "Details"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }
                }}
            >
                <DialogTitle className="flex justify-between items-center bg-white border-b border-gray-100 p-4">
                    <Typography variant="h5" component="div" className="font-bold text-gray-900">
                        {tabIndex === 0 ? "Pending" : "Settled"} Transactions for Seller
                    </Typography>
                </DialogTitle>
                <DialogContent className="p-0 sm:p-6 custom-scrollbar">
                    <TableContainer>
                        <Table size="small">
                            <TableHead className="bg-gray-50/80">
                                <TableRow>
                                    <TableCell className="font-semibold text-gray-900">Customer</TableCell>
                                    <TableCell align="right" className="font-semibold text-gray-900">Amount (₹)</TableCell>
                                    <TableCell align="center" className="font-semibold text-gray-900">Payment Status</TableCell>
                                    <TableCell align="center" className="font-semibold text-gray-900">Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedSellerTransactions.map(tx => (
                                    <TableRow key={tx._id} hover>
                                        <TableCell className="text-gray-700">{tx.customer?.fullName || "N/A"}</TableCell>
                                        <TableCell align="right" className="font-medium text-gray-800">₹{tx.netAmount?.toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={tx.paymentStatus}
                                                color={tx.paymentStatus === 'COMPLETED' ? 'success' : tx.paymentStatus === 'PENDING' ? 'warning' : 'error'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center" className="text-gray-500">
                                            {new Date(tx.date || tx.createdAt || "").toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {selectedSellerTransactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" className="py-8 text-gray-500">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions className="p-4 border-t border-gray-100">
                    <Button onClick={handleCloseDialog} color="inherit" className="font-medium text-gray-600">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PayoutsPage;
