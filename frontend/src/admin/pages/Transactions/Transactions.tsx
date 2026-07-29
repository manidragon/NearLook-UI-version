import React from 'react';
import { 
    Box, Card, Typography, Grid, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, useTheme, alpha 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const mockTransactions = [
    { id: 'TRX-1001', date: '2026-06-25', seller: 'Tech Store', customer: 'Alice M.', amount: 1500.00, fee: 150.00, net: 1350.00, status: 'COMPLETED' },
    { id: 'TRX-1002', date: '2026-06-25', seller: 'Fashion Hub', customer: 'Bob K.', amount: 250.00, fee: 25.00, net: 225.00, status: 'PENDING' },
    { id: 'TRX-1003', date: '2026-06-24', seller: 'Tech Store', customer: 'Charlie B.', amount: 899.99, fee: 89.99, net: 810.00, status: 'COMPLETED' },
    { id: 'TRX-1004', date: '2026-06-24', seller: 'Home Decor', customer: 'Diana P.', amount: 120.00, fee: 12.00, net: 108.00, status: 'FAILED' },
    { id: 'TRX-1005', date: '2026-06-23', seller: 'Sporting Goods', customer: 'Eve S.', amount: 340.50, fee: 34.05, net: 306.45, status: 'COMPLETED' },
];

const Transactions = () => {
    const theme = useTheme();

    const kpiData = [
        { title: "Total Sales", value: "$45,231.89", icon: <ShoppingCartIcon fontSize="large" />, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
        { title: "Platform Revenue (Fees)", value: "$4,523.18", icon: <TrendingUpIcon fontSize="large" />, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
        { title: "Pending Payouts", value: "$12,450.00", icon: <AccountBalanceWalletIcon fontSize="large" />, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
    ];

    return (
        <Box p={3} sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={4}>Transactions & Revenue</Typography>

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
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Seller</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Gross Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }} align="right">Platform Fee</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Net to Seller</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mockTransactions.map((row) => (
                                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: '500' }}>{row.id}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.seller}</TableCell>
                                    <TableCell>{row.customer}</TableCell>
                                    <TableCell align="right">${row.amount.toFixed(2)}</TableCell>
                                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>+${row.fee.toFixed(2)}</TableCell>
                                    <TableCell align="right">${row.net.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status} 
                                            size="small"
                                            color={row.status === 'COMPLETED' ? 'success' : (row.status === 'PENDING' ? 'warning' : 'error')}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default Transactions;
