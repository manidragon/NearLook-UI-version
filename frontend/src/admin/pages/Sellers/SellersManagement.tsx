import React, { useState, useEffect } from 'react';
import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Chip, Avatar, Button, useTheme, alpha,
    FormControl, Select, MenuItem, Menu, IconButton, Rating, Collapse
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchSellers, updateSellerAccountStatus } from '../../../redux/Seller/sellerSlice';

const accountStatuses = [
    { status: 'ALL', title: 'All Sellers', description: 'Show all sellers regardless of their account status' },
    { status: 'PENDING_VERIFICATION', title: 'Pending Verification', description: 'Account is created but not yet verified' },
    { status: 'ACTIVE', title: 'Active', description: 'Account is active and in good standing' },
    { status: 'SUSPENDED', title: 'Suspended', description: 'Account is temporarily suspended, possibly due to violations' },
    { status: 'DEACTIVATED', title: 'Deactivated', description: 'Account is deactivated, user may have chosen to deactivate it' },
    { status: 'BANNED', title: 'Banned', description: 'Account is permanently banned due to severe violations' },
    { status: 'CLOSED', title: 'Closed', description: 'Account is permanently closed, possibly at user request' }
];

const SellerRow = ({ seller, accountStatuses, getStatusColor, handleUpdateSellerAccountStatus }: any) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onStatusChange = (status: string) => {
        handleUpdateSellerAccountStatus(seller._id, status);
        handleClose();
    };

    return (
        <React.Fragment>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell padding="checkbox">
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar variant="rounded" sx={{ bgcolor: theme.palette.primary.main }}>
                            {(seller.businessDetails?.businessName || seller.sellerName)?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight="500">{seller.businessDetails?.businessName || seller.sellerName}</Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Rating value={seller.averageRating || 0} readOnly size="small" precision={0.5} />
                                <Typography variant="caption" color="text.secondary">({seller.numRatings || seller.totalReviews || 0})</Typography>
                            </Box>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">{seller.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{seller.mobile}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="500">{seller.businessDetails?.businessName || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">GSTIN: {seller.GSTIN}</Typography>
                </TableCell>
                <TableCell>
                    <Chip 
                        label={accountStatuses.find((s: any) => s.status === seller.accountStatus)?.title || seller.accountStatus} 
                        size="small"
                        color={getStatusColor(seller.accountStatus || '')}
                        variant="outlined"
                    />
                </TableCell>
                <TableCell align="right">
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Change Status
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {accountStatuses.filter((s: any) => s.status !== 'ALL').map((status: any) => (
                            <MenuItem 
                                key={status.status} 
                                onClick={() => onStatusChange(status.status)}
                            >
                                {status.title}
                            </MenuItem>
                        ))}
                    </Menu>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                Detailed Seller Information
                            </Typography>
                            <Box display="flex" gap={4} mt={2}>
                                <Box flex={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                        Bank & Payouts
                                    </Typography>
                                    <Box mb={1}><Typography variant="body2"><strong>Account Name:</strong> {seller.bankDetails?.accountHolderName || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>Account No:</strong> {seller.bankDetails?.accountNumber || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>IFSC Code:</strong> {seller.bankDetails?.ifscCode || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>UPI ID:</strong> {seller.bankDetails?.upiId || 'N/A'}</Typography></Box>
                                    <Box><Typography variant="body2"><strong>Payout Schedule:</strong> {seller.payoutSchedule || 'WEEKLY'}</Typography></Box>
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                        Business & Compliance
                                    </Typography>
                                    <Box mb={1}><Typography variant="body2"><strong>Address:</strong> {seller.businessDetails?.businessAddress || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>Email:</strong> {seller.businessDetails?.businessEmail || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>Mobile:</strong> {seller.businessDetails?.businessMobile || 'N/A'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>Business Type:</strong> {seller.businessType || 'SOLE_PROPRIETOR'}</Typography></Box>
                                    <Box><Typography variant="body2"><strong>PAN:</strong> {seller.PAN || 'N/A'}</Typography></Box>
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                        Operations & Fulfillment
                                    </Typography>
                                    <Box mb={1}><Typography variant="body2"><strong>Mode:</strong> {seller.fulfillmentMode || 'SELF_SHIP'}</Typography></Box>
                                    <Box mb={1}><Typography variant="body2"><strong>Handling Time:</strong> {seller.handlingTime || 2} Days</Typography></Box>
                                    <Box mb={1}>
                                        <Typography variant="body2">
                                            <strong>SLA Compliance:</strong> {seller.performanceMetrics?.dispatchSlaCompliance || 100}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const SellersManagement = () => {
    const theme = useTheme();
    const [accountStatus, setAccountStatus] = useState("ALL");
    const sellers = useAppSelector(state => state.sellers);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchSellers(accountStatus));
    }, [accountStatus, dispatch]);

    const handleAccountStatusChange = (event: any) => {
        setAccountStatus(event.target.value as string);
    };

    const handleUpdateSellerAccountStatus = (id: any, status: string) => {
        dispatch(updateSellerAccountStatus({ id, status }));
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'ACTIVE': return 'success';
            case 'PENDING_VERIFICATION': return 'warning';
            case 'SUSPENDED':
            case 'BANNED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box p={3}>
            <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                gap={2}
                mb={4}
            >
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">Sellers & Payouts</Typography>
                    <Typography variant="body2" color="text.secondary">Manage seller verification, adjust statuses, and monitor details.</Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                    <Select
                        value={accountStatus}
                        onChange={handleAccountStatusChange}
                        displayEmpty
                        sx={{ 
                            borderRadius: 2, 
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                            },
                            '& .MuiSelect-select': {
                                py: 1.2,
                                px: 2,
                                fontWeight: 500,
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        {accountStatuses.map((status) => (
                            <MenuItem 
                                key={status.status} 
                                value={status.status}
                                sx={{ 
                                    py: 1.5, 
                                    px: 2,
                                    borderRadius: 1,
                                    mx: 1,
                                    my: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                        }
                                    }
                                }}
                            >
                                {status.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell padding="checkbox" />
                                <TableCell sx={{ fontWeight: 'bold' }}>Seller Info</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Business</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sellers.sellers?.map((seller) => (
                                <SellerRow 
                                    key={seller._id} 
                                    seller={seller} 
                                    accountStatuses={accountStatuses}
                                    getStatusColor={getStatusColor}
                                    handleUpdateSellerAccountStatus={handleUpdateSellerAccountStatus}
                                />
                            ))}
                            {(!sellers.sellers || sellers.sellers.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">No sellers found for status "{accountStatuses.find(s => s.status === accountStatus)?.title}".</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default SellersManagement;
