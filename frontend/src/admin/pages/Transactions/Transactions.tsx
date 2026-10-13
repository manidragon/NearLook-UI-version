import { useEffect, useMemo } from 'react';
import { 
    Box, Card, Typography, Grid, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, useTheme, alpha 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchAllTransactions, fetchAllPayouts } from '../../../redux/Admin/AdminPayoutSlice';
import dayjs from 'dayjs';

const Transactions = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { transactions, payouts, loading } = useAppSelector(state => state.adminPayouts);

    useEffect(() => {
        dispatch(fetchAllTransactions());
        dispatch(fetchAllPayouts());
    }, [dispatch]);

    // Calculate real-time KPI data
    const kpiMetrics = useMemo(() => {
        let totalSales = 0;
        let platformRevenue = 0;
        let pendingPayouts = 0;

        transactions.forEach(t => {
            totalSales += t.amount || 0;
            platformRevenue += t.platformFee || 0;
        });

        payouts.forEach(p => {
            if (p.status === 'PENDING') {
                pendingPayouts += p.amount || 0;
            }
        });

        return { totalSales, platformRevenue, pendingPayouts };
    }, [transactions, payouts]);

    const kpiData = [
        { title: "Total Sales", value: `₹${kpiMetrics.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <ShoppingCartIcon fontSize="large" />, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
        { title: "Platform Revenue (Fees)", value: `₹${kpiMetrics.platformRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <TrendingUpIcon fontSize="large" />, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
        { title: "Pending Payouts", value: `₹${kpiMetrics.pendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <AccountBalanceWalletIcon fontSize="large" />, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
    ];

    // Sort transactions by date (newest first)
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    }, [transactions]);

    return (
        <Box p={3} sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#111827' }} mb={4}>Transactions & Revenue</Typography>

            {/* KPI Cards */}
            <Grid container spacing={3} mb={4}>
                {kpiData.map((kpi, index) => (
                    <Grid size={{ xs: 12, sm: 12, md: 6, xl: 4 }} key={index}>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ backgroundColor: kpi.bg, color: kpi.color, p: 2, borderRadius: 2 }}>
                                {kpi.icon}
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">{kpi.title}</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>{kpi.value}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Transactions Table */}
            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Transactions</Typography>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', maxHeight: '500px' }}>
                    <Table sx={{ minWidth: 700 }} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }}>Transaction ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }}>Seller</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }} align="right">Gross Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'success.main', backgroundColor: '#f8fafc' }} align="right">Platform Fee</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }} align="right">Net to Seller</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827', backgroundColor: '#f8fafc' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography variant="body1" color="text.secondary">Loading transactions...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : sortedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography variant="body1" color="text.secondary">No transactions found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedTransactions.map((row) => (
                                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ fontWeight: '500', color: '#111827' }}>
                                            {row._id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151' }}>
                                            {row.createdAt ? dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151' }}>
                                            {row.seller?.businessDetails?.businessName || row.seller?.sellerName || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151' }}>
                                            {row.customer?.fullName || 'N/A'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#374151' }}>
                                            ₹{(row.amount || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                            +₹{(row.platformFee || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#374151' }}>
                                            ₹{(row.netAmount || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.isSettled ? 'SETTLED' : 'PENDING'} 
                                                size="small"
                                                color={row.isSettled ? 'success' : 'warning'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default Transactions;
