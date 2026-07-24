import React, { useEffect, useState } from 'react';
import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Rating, IconButton, useTheme, alpha, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchAdminProductReviews, fetchAdminSellerReviews } from '../../../redux/Admin/AdminReviewSlice';

const ReviewsModeration = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { productReviews, sellerReviews } = useAppSelector(state => state.adminReviews);
    
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleViewReview = (review: any) => {
        setSelectedReview(review);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReview(null);
    };

    useEffect(() => {
        dispatch(fetchAdminProductReviews());
        dispatch(fetchAdminSellerReviews());
    }, [dispatch]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary">Reviews Moderation</Typography>
                <Typography variant="body2" color="text.secondary">Review, approve, or delete product reviews and seller ratings.</Typography>
            </Box>

            <Tabs 
                value={tabIndex} 
                onChange={handleTabChange} 
                sx={{ mb: 2 }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab label="Product Reviews" />
                <Tab label="Seller Reviews" />
            </Tabs>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>{tabIndex === 0 ? 'Product' : 'Seller'}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(tabIndex === 0 ? productReviews : sellerReviews)?.map((review: any) => (
                                <TableRow key={review._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: '500' }}>
                                        {tabIndex === 0 
                                            ? review.product?.title || 'Unknown Product'
                                            : review.seller?.sellerName || 'Unknown Seller'}
                                    </TableCell>
                                    <TableCell>{review.user?.fullName || review.user?.email || 'Guest'}</TableCell>
                                    <TableCell>
                                        <Rating value={review.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {review.reviewText}
                                    </TableCell>
                                    <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleViewReview(review)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Review Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    Review Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedReview && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    {tabIndex === 0 ? 'Product Info' : 'Seller Info'}
                                </Typography>
                                {tabIndex === 0 ? (
                                    <>
                                        <Typography variant="body2" mb={1}><strong>Product:</strong> {selectedReview.product?.title || 'Unknown'}</Typography>
                                        <Typography variant="body2" mb={1}><strong>Brand:</strong> {selectedReview.product?.brand || 'N/A'}</Typography>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="body2" mb={1}><strong>Seller Name:</strong> {selectedReview.seller?.sellerName || 'Unknown'}</Typography>
                                        <Typography variant="body2" mb={1}><strong>Business:</strong> {selectedReview.seller?.businessDetails?.businessName || 'N/A'}</Typography>
                                    </>
                                )}

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight="bold" mb={2}>Reviewer Info</Typography>
                                <Typography variant="body2" mb={1}><strong>Name:</strong> {selectedReview.user?.fullName || 'Guest'}</Typography>
                                <Typography variant="body2" mb={1}><strong>Email:</strong> {selectedReview.user?.email || 'N/A'}</Typography>
                                <Typography variant="body2" mb={1}><strong>Date:</strong> {new Date(selectedReview.createdAt).toLocaleString()}</Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>Rating & Feedback</Typography>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Typography variant="body2" fontWeight="bold" mr={1}>Rating:</Typography>
                                    <Rating value={selectedReview.rating} readOnly />
                                </Box>
                                <Typography variant="body2" fontWeight="bold" mb={1}>Comment:</Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), minHeight: 100 }}>
                                    <Typography variant="body2">{selectedReview.reviewText || 'No comment provided.'}</Typography>
                                </Paper>
                            </Grid>

                            {selectedReview.productImages && selectedReview.productImages.length > 0 && (
                                <Grid size={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" mb={2}>Review Images</Typography>
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        {selectedReview.productImages.map((img: string, index: number) => (
                                            <Box 
                                                key={index}
                                                component="img"
                                                src={img}
                                                alt={`Review Image ${index + 1}`}
                                                sx={{ 
                                                    width: 150, 
                                                    height: 150, 
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    boxShadow: 1,
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            )}
                            
                            {selectedReview.images && selectedReview.images.length > 0 && (
                                <Grid size={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" mb={2}>Review Images</Typography>
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        {selectedReview.images.map((img: string, index: number) => (
                                            <Box 
                                                key={index}
                                                component="img"
                                                src={img}
                                                alt={`Review Image ${index + 1}`}
                                                sx={{ 
                                                    width: 150, 
                                                    height: 150, 
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    boxShadow: 1,
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            )}
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

export default ReviewsModeration;
