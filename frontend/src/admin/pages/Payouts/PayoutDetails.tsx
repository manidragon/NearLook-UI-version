import React, { useEffect, useState } from "react";
import { DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, TextField, Box, Table, TableBody, TableCell, TableHead, TableRow, Card, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchPayoutDetails, completePayout, clearSelectedPayout } from "../../../redux/Admin/AdminPayoutSlice";
import CustomLoader from "../../../components/CustomLoader";

interface Props {
    payoutId: string;
    onClose: () => void;
}

const PayoutDetails = ({ payoutId, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const { selectedPayout, loading } = useAppSelector((state) => state.adminPayouts);
    const [transferId, setTransferId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchPayoutDetails(payoutId));
        return () => {
            dispatch(clearSelectedPayout());
        };
    }, [dispatch, payoutId]);

    const handleComplete = async () => {
        if (!transferId) {
            alert("Please enter a Razorpay Transfer Reference ID.");
            return;
        }
        setSubmitting(true);
        try {
            await dispatch(completePayout({ id: payoutId, razorpayTransferId: transferId })).unwrap();
            onClose();
        } catch (error) {
            alert("Failed to complete payout");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !selectedPayout) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
                <CustomLoader size={48} className="text-[#FF5A00] mb-4" />
                <Typography className="text-gray-500 font-medium animate-pulse">Loading details...</Typography>
            </Box>
        );
    }

    const { seller, amount, status, transactions, razorpayTransferId } = selectedPayout;

    return (
        <div className="bg-gray-50/30">
            <DialogTitle className="flex justify-between items-center bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <ReceiptLongIcon className="text-[#FF5A00]" />
                    <span className="font-bold text-xl text-gray-800">Payout Details</span>
                </div>
                <IconButton onClick={onClose} size="small" className="text-gray-400 hover:text-gray-600 bg-gray-50">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent className="p-0 sm:p-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4 px-4 sm:px-0">
                    {/* Seller Info Card */}
                    <Card className="p-4 sm:p-5 shadow-sm border border-gray-100 rounded-xl bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                            <PersonIcon className="text-blue-500" />
                            <Typography variant="h6" className="font-bold text-gray-800 text-lg">Seller Profile</Typography>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{seller?.sellerName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{seller?.email}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="font-medium text-gray-800">{seller?.mobile}</span></div>
                        </div>
                    </Card>

                    {/* Bank Info Card */}
                    <Card className="p-4 sm:p-5 shadow-sm border border-gray-100 rounded-xl bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                            <AccountBalanceIcon className="text-green-500" />
                            <Typography variant="h6" className="font-bold text-gray-800 text-lg">Banking Details</Typography>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Account No:</span> <span className="font-medium text-gray-800">{seller?.bankDetails?.accountNumber}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">IFSC Code:</span> <span className="font-medium text-gray-800">{seller?.bankDetails?.ifscCode}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Account Name:</span> <span className="font-medium text-gray-800">{seller?.bankDetails?.accountHolderName}</span></div>
                            {seller?.bankDetails?.upiId && (
                                <div className="flex justify-between"><span className="text-gray-500">UPI ID:</span> <span className="font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded text-sm">{seller?.bankDetails?.upiId}</span></div>
                            )}
                        </div>
                    </Card>
                </div>
                
                {/* Summary Banner */}
                <div className="mx-4 sm:mx-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                        <AccountBalanceWalletIcon sx={{ fontSize: 120 }} />
                    </div>
                    <div className="z-10 mb-4 sm:mb-0">
                        <Typography className="text-gray-300 font-medium mb-1">Total Payout Amount</Typography>
                        <Typography variant="h3" className="font-bold text-white tracking-tight">₹{amount?.toLocaleString()}</Typography>
                    </div>
                    <div className="z-10 flex flex-col items-start sm:items-end">
                        <Typography className="text-gray-400 text-sm mb-2">Status</Typography>
                        <Chip
                            icon={status === 'COMPLETED' ? <CheckCircleIcon /> : undefined}
                            label={status}
                            color={status === 'COMPLETED' ? 'success' : status === 'PENDING' ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold', px: 1, backgroundColor: status === 'PENDING' ? '#ed6c02' : undefined }}
                            className={status === 'PENDING' ? 'text-white' : ''}
                        />
                        {status === 'COMPLETED' && razorpayTransferId && (
                            <Typography className="text-gray-300 text-xs mt-3 flex flex-col items-end">
                                <span className="opacity-70">Razorpay Ref</span>
                                <span className="font-mono bg-black/20 px-2 py-1 rounded mt-1">{razorpayTransferId}</span>
                            </Typography>
                        )}
                    </div>
                </div>
                
                <div className="px-4 sm:px-0">
                    <Typography variant="subtitle1" className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        Included Transactions <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{transactions.length} orders</span>
                    </Typography>
                    <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white mb-6">
                        <div className="overflow-x-auto">
                            <Table size="small">
                                <TableHead className="bg-gray-50/80">
                                    <TableRow>
                                        <TableCell className="font-semibold text-gray-600 py-3">Order ID</TableCell>
                                        <TableCell align="right" className="font-semibold text-gray-600 py-3">Customer Paid</TableCell>
                                        <TableCell align="right" className="font-semibold text-gray-600 py-3">Platform Fee</TableCell>
                                        <TableCell align="right" className="font-semibold text-gray-800 py-3">Seller Earning</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(transactions as any[]).map((tx, index) => (
                                        <TableRow key={index} hover sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell className="font-mono text-xs text-gray-500">{tx.order?._id}</TableCell>
                                            <TableCell align="right" className="font-medium text-gray-700">₹{tx.amount?.toLocaleString()}</TableCell>
                                            <TableCell align="right" className="text-red-500 font-medium bg-red-50/30">-₹7</TableCell>
                                            <TableCell align="right" className="font-bold text-green-600">₹{(tx.amount - 7).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {status === 'PENDING' && (
                    <div className="mx-4 sm:mx-0 mb-4 p-5 sm:p-6 border border-orange-200 bg-orange-50/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AccountBalanceWalletIcon className="text-[#FF5A00]" />
                            <Typography variant="subtitle1" className="font-bold text-gray-800">Process Payout Manually</Typography>
                        </div>
                        <Typography variant="body2" className="text-gray-600 mb-4">
                            Transfer <strong className="text-gray-900 text-lg">₹{amount?.toLocaleString()}</strong> to the seller's bank account via Razorpay dashboard. Once completed, enter the Reference ID below to mark this settlement as complete.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Razorpay Transfer Reference ID"
                            variant="outlined"
                            placeholder="e.g. trf_KJH..."
                            value={transferId}
                            onChange={(e) => setTransferId(e.target.value)}
                            sx={{ backgroundColor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                    </div>
                )}
            </DialogContent>
            
            <DialogActions className="bg-white border-t border-gray-100 p-4 sm:px-6">
                <Button onClick={onClose} color="inherit" className="font-medium text-gray-600 hover:bg-gray-100 px-4">
                    Close
                </Button>
                {status === 'PENDING' && (
                    <Button 
                        onClick={handleComplete} 
                        disabled={submitting || !transferId}
                        variant="contained" 
                        className="bg-gradient-to-r from-[#FF5A00] to-[#ff7a33] text-white shadow-md hover:shadow-lg disabled:opacity-70 px-6"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                    >
                        {submitting ? <CustomLoader size={24} color="inherit" /> : "Confirm Settlement"}
                    </Button>
                )}
            </DialogActions>
        </div>
    );
};

export default PayoutDetails;
