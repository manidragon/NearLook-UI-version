import React, { useEffect, useState } from 'react';
import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Chip, Avatar, IconButton, Collapse,
    InputBase, alpha, useTheme, Rating, Select, MenuItem, FormControl
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchAllAdminProducts, updateProductStatus, selectProducts } from '../../../redux/Customer/ProductSlice';

const ProductRow = ({ product, handleStatusChange }: any) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    
    // Extract info
    const image = product.variants?.[0]?.images?.[0] || '';
    const sellerName = product.seller?.businessDetails?.businessName || product.seller?.sellerName || product.sellerBusinessName || 'Multiple Sellers';
    const categoryName = product.category?.name || product.categoryName || 'Unknown';
    const price = product.minPrice || product.variants?.[0]?.offers?.[0]?.sellingPrice || 0;
    const stock = product.variants?.reduce((acc: number, v: any) => acc + (v.offers?.reduce((s: number, o: any) => s + (o.stock || 0), 0) || 0), 0) || 0;

    return (
        <React.Fragment>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
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
                        <Avatar src={image} variant="rounded" sx={{ width: 50, height: 50 }} />
                        <Box>
                            <Typography variant="body1" fontWeight="500">{product.title}</Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Rating value={product.averageRating || 0} readOnly size="small" precision={0.5} />
                                <Typography variant="caption" color="text.secondary">({product.numRatings || product.totalReviews || 0})</Typography>
                            </Box>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{sellerName}</TableCell>
                <TableCell>
                    <Chip label={categoryName} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>₹{price}</TableCell>
                <TableCell>
                    <Typography color={stock === 0 ? 'error' : (stock < 20 ? 'warning.main' : 'success.main')} fontWeight="bold">
                        {stock === 0 ? 'Out of Stock' : `${stock} left`}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip 
                        label={product.approvalStatus || 'APPROVED'} 
                        size="small"
                        color={product.approvalStatus === 'APPROVED' ? 'success' : (product.approvalStatus === 'PENDING' ? 'warning' : 'error')}
                        icon={(!product.approvalStatus || product.approvalStatus === 'APPROVED') ? <VerifiedIcon /> : undefined}
                    />
                </TableCell>
                <TableCell align="right">
                    <FormControl size="small">
                        <Select
                            value={product.approvalStatus || 'APPROVED'}
                            onChange={(e) => handleStatusChange(product._id as string, e.target.value)}
                            sx={{ fontSize: '0.875rem', height: 32 }}
                        >
                            <MenuItem value="APPROVED">APPROVE</MenuItem>
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="REJECTED">REJECT</MenuItem>
                        </Select>
                    </FormControl>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                Variants & Sellers Details
                            </Typography>
                            {product.variants?.map((variant: any, vIndex: number) => (
                                <Box key={vIndex} mb={2} p={2} border={1} borderColor={alpha(theme.palette.divider, 0.5)} borderRadius={2} bgcolor="background.paper">
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Typography variant="subtitle2" fontWeight="bold">Color: {variant.color}</Typography>
                                        {variant.specifications && Object.entries(variant.specifications).map(([k, v]) => (
                                            <Chip key={k} label={`${k}: ${v}`} size="small" />
                                        ))}
                                    </Box>
                                    <Table size="small" aria-label="sellers">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: alpha(theme.palette.divider, 0.1) }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Seller</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>MRP</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Selling Price</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {variant.offers?.map((offer: any, oIndex: number) => (
                                                <TableRow key={oIndex} hover>
                                                    <TableCell>
                                                        {offer.seller?.businessDetails?.businessName || offer.seller?.sellerName || product.seller?.businessDetails?.businessName || product.seller?.sellerName || product.sellerBusinessName || offer.seller || 'Unknown Seller'}
                                                    </TableCell>
                                                    <TableCell sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>₹{offer.mrpPrice}</TableCell>
                                                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>₹{offer.sellingPrice}</TableCell>
                                                    <TableCell>
                                                        <Typography color={offer.stock === 0 ? 'error' : 'text.primary'} fontWeight="500">
                                                            {offer.stock}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {(!variant.offers || variant.offers.length === 0) && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">No sellers listed for this variant.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ))}
                            {(!product.variants || product.variants.length === 0) && (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                    No variants found for this product.
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const AllProducts = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchAllAdminProducts());
    }, [dispatch]);

    const handleStatusChange = (productId: string, newStatus: string) => {
        dispatch(updateProductStatus({ productId, status: newStatus }));
    };

    const filteredProducts = products?.filter(product => 
        (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (product.seller?.sellerName && product.seller.sellerName.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

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
                    <Typography variant="h4" fontWeight="bold" color="primary">Global Products</Typography>
                    <Typography variant="body2" color="text.secondary">Manage and moderate all products across the platform</Typography>
                </Box>
                
                {/* Search Bar */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: alpha(theme.palette.common.black, 0.05),
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        width: { xs: '100%', sm: '350px' }
                    }}
                >
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <InputBase 
                        placeholder="Search products or sellers..." 
                        fullWidth 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Seller</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <ProductRow key={product._id} product={product} handleStatusChange={handleStatusChange} />
                            ))}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">No products found</Typography>
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

export default AllProducts;
