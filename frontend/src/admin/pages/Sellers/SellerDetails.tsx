import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  Box, Typography, Avatar, Chip, Card, CardContent, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Button, Rating, Tabs, Tab, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton as MuiIconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StarIcon from '@mui/icons-material/Star';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchSellerDetailsForAdmin, updateSellerAccountStatus } from '../../../redux/Seller/sellerSlice';

const accountStatuses = [
  { status: 'PENDING_VERIFICATION', title: 'Pending Verification', color: '#f59e0b' },
  { status: 'ACTIVE', title: 'Active', color: '#10b981' },
  { status: 'SUSPENDED', title: 'Suspended', color: '#ef4444' },
  { status: 'DEACTIVATED', title: 'Deactivated', color: '#6b7280' },
  { status: 'BANNED', title: 'Banned', color: '#7f1d1d' },
  { status: 'CLOSED', title: 'Closed', color: '#374151' },
];

const statusColor = (status: string) => {
  const s = accountStatuses.find(x => x.status === status);
  return s?.color ?? '#6b7280';
};

function MetricCard({ label, value, icon, color }: any) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: '100%', background: `linear-gradient(135deg, ${color}10, ${color}05)` }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{label}</Typography>
          <Box sx={{ bgcolor: `${color}20`, p: 0.75, borderRadius: 2, display: 'flex' }}>{icon}</Box>
        </Box>
        <Typography variant="h6" fontWeight={700} color={color} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ minWidth: { xs: 120, sm: 140 } }}>{label}:</Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1 }}>{value}</Typography>
    </Box>
  );
}

export default function SellerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sellerDetails, detailsLoading } = useAppSelector(state => state.sellers);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchSellerDetailsForAdmin(id));
  }, [id, dispatch]);

  if (detailsLoading || !sellerDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { seller, metrics, recentOrders, products, reviews } = sellerDetails;

  const handleStatusChange = (status: string) => {
    dispatch(updateSellerAccountStatus({ id: seller._id, status }));
    setAnchorEl(null);
    setTimeout(() => { if (id) dispatch(fetchSellerDetailsForAdmin(id)); }, 500);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/sellers')}
        sx={{ mb: 2, color: '#FF5A00', textTransform: 'none', fontWeight: 600 }}
      >
        Back to Sellers
      </Button>

      {/* ─── Profile Header ─── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 7, background: 'linear-gradient(90deg, #FF5A00, #ff8c00)' }} />
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5, alignItems: { xs: 'flex-start', sm: 'flex-start' } }}>
            <Avatar
              src={seller.businessDetails?.logo}
              sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, fontSize: 30, fontWeight: 700, bgcolor: '#FF5A00', border: '3px solid white', boxShadow: '0 4px 16px rgba(255,90,0,0.25)', flexShrink: 0 }}
            >
              {seller.businessDetails?.businessName?.charAt(0) || seller.sellerName?.charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                  {seller.businessDetails?.businessName || seller.sellerName}
                </Typography>
                <Chip
                  label={seller.accountStatus?.replace('_', ' ') || 'UNKNOWN'}
                  size="small"
                  sx={{ bgcolor: `${statusColor(seller.accountStatus)}20`, color: statusColor(seller.accountStatus), fontWeight: 700, border: `1px solid ${statusColor(seller.accountStatus)}50`, flexShrink: 0 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Rating value={metrics.averageRating} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary">({metrics.totalReviews} reviews)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 }, color: 'text.secondary' }}>
                {seller.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{seller.email}</Typography>
                  </Box>
                )}
                {seller.mobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{seller.mobile}</Typography>
                  </Box>
                )}
                {seller.district && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">{seller.district}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' }, flexShrink: 0 }}>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04e00' }, textTransform: 'none', borderRadius: 2 }}
              >
                Change Status ▾
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {accountStatuses.map(s => (
                  <MenuItem key={s.status} onClick={() => handleStatusChange(s.status)} sx={{ color: s.color, fontWeight: 500, fontSize: 14 }}>
                    {s.title}
                  </MenuItem>
                ))}
              </Menu>
              {seller.GSTIN && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>GSTIN: {seller.GSTIN}</Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Joined: {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ─── Metrics Row ─── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Orders', value: metrics.totalOrders, icon: <ReceiptIcon fontSize="small" sx={{ color: '#6366f1' }} />, color: '#6366f1' },
          { label: 'Revenue', value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`, icon: <AttachMoneyIcon fontSize="small" sx={{ color: '#10b981' }} />, color: '#10b981' },
          { label: 'Products', value: metrics.activeProducts, icon: <Inventory2Icon fontSize="small" sx={{ color: '#f59e0b' }} />, color: '#f59e0b' },
          { label: 'Avg Rating', value: `${metrics.averageRating} ★`, icon: <StarIcon fontSize="small" sx={{ color: '#FF5A00' }} />, color: '#FF5A00' },
          { label: 'Reviews', value: metrics.totalReviews, icon: <StarIcon fontSize="small" sx={{ color: '#8b5cf6' }} />, color: '#8b5cf6' },
          { label: 'Cancelled', value: metrics.cancelledOrders, icon: <CancelIcon fontSize="small" sx={{ color: '#ef4444' }} />, color: '#ef4444' },
        ].map(m => (
          <Grid key={m.label} size={{ xs: 6, sm: 4, md: 4, lg: 2 }}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      {/* ─── Business + Bank Info ─── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <StorefrontIcon sx={{ color: '#FF5A00' }} />
                <Typography variant="subtitle1" fontWeight={700}>Business Details</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  ['Business Name', seller.businessDetails?.businessName],
                  ['Business Email', seller.businessDetails?.businessEmail],
                  ['Business Mobile', seller.businessDetails?.businessMobile],
                  ['Business Address', seller.businessDetails?.businessAddress],
                  ['Business Type', seller.businessType ? seller.businessType.replace('_', ' ') : null],
                  ['Incorporation Date', seller.incorporationDate ? new Date(seller.incorporationDate).toLocaleDateString('en-IN') : null],
                  ['GSTIN', seller.GSTIN],
                  ['PAN', seller.PAN],
                ].filter(([, v]) => Boolean(v)).map(([label, value]) => (
                  <InfoRow key={label as string} label={label as string} value={value as string} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AttachMoneyIcon sx={{ color: '#10b981' }} />
                <Typography variant="subtitle1" fontWeight={700}>Bank & Performance</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  ['Account Number', seller.bankDetails?.accountNumber ? `****${String(seller.bankDetails.accountNumber).slice(-4)}` : null],
                  ['IFSC Code', seller.bankDetails?.ifscCode],
                  ['Account Holder', seller.bankDetails?.accountHolderName],
                  ['Profile Views', seller.performanceMetrics?.profileViews],
                  ['Followers', seller.performanceMetrics?.followersCount],
                ].filter(([, v]) => v !== null && v !== undefined).map(([label, value]) => (
                  <InfoRow key={label as string} label={label as string} value={String(value)} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Operational + Storefront Info ─── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <LocalShippingIcon sx={{ color: '#6366f1' }} />
                <Typography variant="subtitle1" fontWeight={700}>Operational Details</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  ['Fulfillment Mode', seller.fulfillmentMode ? seller.fulfillmentMode.replace('_', ' ') : null],
                  ['Handling Time', seller.handlingTime ? `${seller.handlingTime} Days` : null],
                  ['Min Free Delivery', seller.minFreeDelivery ? `₹${seller.minFreeDelivery}` : null],
                  ['Cancellation Rate', seller.performanceMetrics?.cancellationRate !== undefined ? `${seller.performanceMetrics.cancellationRate}%` : null],
                  ['Return Rate', seller.performanceMetrics?.returnRate !== undefined ? `${seller.performanceMetrics.returnRate}%` : null],
                  ['SLA Compliance', seller.performanceMetrics?.dispatchSlaCompliance !== undefined ? `${seller.performanceMetrics.dispatchSlaCompliance}%` : null],
                ].filter(([, v]) => v !== null && v !== undefined).map(([label, value]) => (
                  <InfoRow key={label as string} label={label as string} value={value as string} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <LanguageIcon sx={{ color: '#8b5cf6' }} />
                <Typography variant="subtitle1" fontWeight={700}>Storefront Details</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  ['Holiday Mode', seller.storefront?.holidayMode ? '✅ Active' : '❌ Inactive'],
                  ['Facebook', seller.storefront?.socialLinks?.facebook],
                  ['Instagram', seller.storefront?.socialLinks?.instagram],
                  ['Twitter', seller.storefront?.socialLinks?.twitter],
                  ['Website', seller.storefront?.socialLinks?.website],
                ].filter(([, v]) => Boolean(v)).map(([label, value]) => (
                  typeof value === 'string' ? (
                    <InfoRow key={label as string} label={label as string} value={value} />
                  ) : (
                    <Box key={label as string} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ minWidth: { xs: 120, sm: 140 } }}>{label}:</Typography>
                      {value}
                    </Box>
                  )
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Tabbed Sections ─── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 1, sm: 2 }, pt: 1, borderBottom: '1px solid #f0f0f0',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
            '& .Mui-selected': { color: '#FF5A00' },
            '& .MuiTabs-indicator': { bgcolor: '#FF5A00' },
          }}
        >
          <Tab label={`Products (${products.length})`} />
          <Tab label={`Orders (${recentOrders.length})`} />
          <Tab label={`Reviews (${reviews.length})`} />
        </Tabs>

        <Box sx={{ p: { xs: 1, sm: 2 } }}>

          {/* ── Products Tab ── */}
          {tab === 0 && (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 340, sm: 500 } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: '#374151', bgcolor: '#fafafa', borderBottom: '2px solid #f0f0f0', whiteSpace: 'nowrap' } }}>
                    <TableCell>Product</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Added On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No products found</TableCell></TableRow>
                  ) : products.map((p: any) => (
                    <TableRow
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#fff7f3' }, transition: 'background 0.15s' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {p.images?.[0] && (
                            <Avatar src={p.images[0]} variant="rounded" sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, border: '1px solid #f0f0f0', flexShrink: 0 }} />
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#FF5A00', wordBreak: 'break-word' }}>{p.title}</Typography>
                            {p.category?.name && (
                              <Typography variant="caption" color="text.secondary">{p.category.name}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={p.isOwner ? '👑 Owner' : '🏷️ Lister'}
                          size="small"
                          sx={{ bgcolor: p.isOwner ? '#ede9fe' : '#e0f2fe', color: p.isOwner ? '#6d28d9' : '#0369a1', fontWeight: 700, fontSize: 10 }}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={p.approvalStatus || 'PENDING'}
                          size="small"
                          sx={{
                            bgcolor: p.approvalStatus === 'APPROVED' ? '#dcfce7' : p.approvalStatus === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                            color: p.approvalStatus === 'APPROVED' ? '#15803d' : p.approvalStatus === 'REJECTED' ? '#dc2626' : '#a16207',
                            fontWeight: 600, fontSize: 10
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ── Orders Tab ── */}
          {tab === 1 && (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 380, sm: 560 } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: '#374151', bgcolor: '#fafafa', borderBottom: '2px solid #f0f0f0', whiteSpace: 'nowrap' } }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Payment</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No orders found</TableCell></TableRow>
                  ) : recentOrders.map((o: any) => (
                    <TableRow key={o._id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">{String(o._id).slice(-8)}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        <Typography variant="body2">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : 'N/A'}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={600}>₹{(o.totalSellingPrice || 0).toLocaleString('en-IN')}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        <Chip label={o.paymentStatus || 'N/A'} size="small"
                          sx={{ bgcolor: o.paymentStatus === 'COMPLETED' ? '#dcfce7' : '#fef9c3', color: o.paymentStatus === 'COMPLETED' ? '#15803d' : '#a16207', fontWeight: 600, fontSize: 10 }} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip label={o.orderStatus || 'N/A'} size="small"
                          sx={{
                            bgcolor: o.orderStatus === 'DELIVERED' ? '#dcfce7' : o.orderStatus === 'CANCELLED' ? '#fee2e2' : '#e0f2fe',
                            color: o.orderStatus === 'DELIVERED' ? '#15803d' : o.orderStatus === 'CANCELLED' ? '#dc2626' : '#0369a1',
                            fontWeight: 600, fontSize: 10
                          }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ── Reviews Tab ── */}
          {tab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reviews.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>No reviews yet</Box>
              ) : reviews.map((r: any) => (
                <Box key={r._id} sx={{ p: 2, border: '1px solid #f0f0f0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                    <Avatar src={r.user?.profilePicture} sx={{ width: 36, height: 36 }}>{r.user?.fullName?.charAt(0) || 'U'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{r.user?.fullName || 'Anonymous'}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}</Typography>
                    </Box>
                    <Rating value={r.rating} readOnly size="small" precision={0.5} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{r.reviewText}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* ─── Product Detail Modal ─── */}
      <Dialog
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', m: { xs: 1, sm: 2 } } }}
      >
        {selectedProduct && (
          <>
            <Box sx={{ height: 6, background: selectedProduct.isOwner ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,#0ea5e9,#38bdf8)' }} />
            <DialogTitle sx={{ pb: 1, pr: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedProduct.images?.[0] && (
                  <Avatar src={selectedProduct.images[0]} variant="rounded" sx={{ width: { xs: 44, sm: 56 }, height: { xs: 44, sm: 56 }, border: '1px solid #f0f0f0', flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>{selectedProduct.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedProduct.isOwner ? '👑 Product Owner' : '🏷️ Offer Lister Only'}
                      size="small"
                      sx={{ bgcolor: selectedProduct.isOwner ? '#ede9fe' : '#e0f2fe', color: selectedProduct.isOwner ? '#6d28d9' : '#0369a1', fontWeight: 700 }}
                    />
                    <Chip
                      label={selectedProduct.approvalStatus || 'PENDING'}
                      size="small"
                      sx={{
                        bgcolor: selectedProduct.approvalStatus === 'APPROVED' ? '#dcfce7' : selectedProduct.approvalStatus === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                        color: selectedProduct.approvalStatus === 'APPROVED' ? '#15803d' : selectedProduct.approvalStatus === 'REJECTED' ? '#dc2626' : '#a16207',
                        fontWeight: 700
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <MuiIconButton onClick={() => setSelectedProduct(null)} sx={{ position: 'absolute', right: 12, top: 16, color: 'text.secondary' }}>
                <CloseIcon />
              </MuiIconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#FF5A00' }}>Product Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      ['Category', selectedProduct.category?.name || 'N/A'],
                      ['Avg Rating', selectedProduct.averageRating ? `${selectedProduct.averageRating} ★ (${selectedProduct.totalReviews} reviews)` : 'No ratings'],
                      ['Price Range', selectedProduct.minPrice ? `₹${selectedProduct.minPrice?.toLocaleString('en-IN')} – ₹${selectedProduct.maxPrice?.toLocaleString('en-IN')}` : 'N/A'],
                      ['Created On', selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'],
                      ['Slug', selectedProduct.slug || 'N/A'],
                    ].map(([label, value]) => (
                      <InfoRow key={label} label={label} value={value} />
                    ))}
                  </Box>

                  {selectedProduct.description && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#FF5A00' }}>Description</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {selectedProduct.description?.length > 300 ? selectedProduct.description.slice(0, 300) + '…' : selectedProduct.description}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: selectedProduct.isOwner ? '#f5f3ff' : '#f0f9ff', border: `1px solid ${selectedProduct.isOwner ? '#ddd6fe' : '#bae6fd'}` }}>
                    <Typography variant="body2" fontWeight={600} color={selectedProduct.isOwner ? '#6d28d9' : '#0369a1'}>
                      {selectedProduct.isOwner
                        ? '👑 This seller is the original creator of this product listing.'
                        : '🏷️ This seller has listed their own offers/prices on an existing product — they did not create the base product.'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#FF5A00' }}>
                    This Seller's Offers ({selectedProduct.sellerVariants?.length || 0} variants)
                  </Typography>
                  {(!selectedProduct.sellerVariants || selectedProduct.sellerVariants.length === 0) ? (
                    <Typography variant="body2" color="text.secondary">No specific offers found for this seller.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 360, overflowY: 'auto' }}>
                      {selectedProduct.sellerVariants.map((v: any, vi: number) => (
                        <Card key={v._id || vi} elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2 }}>
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            {v.specifications && Object.keys(v.specifications).length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {Object.entries(v.specifications).map(([k, val]) => (
                                  <Chip key={k} label={`${k}: ${val}`} size="small" sx={{ fontSize: 10, height: 20 }} />
                                ))}
                              </Box>
                            )}
                            {v.sellerOffers.map((offer: any, oi: number) => (
                              <Box key={oi} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">MRP</Typography>
                                  <Typography variant="body2" fontWeight={500}>₹{(offer.mrpPrice || 0).toLocaleString('en-IN')}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Selling Price</Typography>
                                  <Typography variant="body2" fontWeight={700} color="#10b981">₹{(offer.sellingPrice || 0).toLocaleString('en-IN')}</Typography>
                                </Box>
                                {offer.mrpPrice > 0 && offer.sellingPrice < offer.mrpPrice && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Discount</Typography>
                                    <Typography variant="body2" fontWeight={600} color="#ef4444">
                                      {Math.round(((offer.mrpPrice - offer.sellingPrice) / offer.mrpPrice) * 100)}% off
                                    </Typography>
                                  </Box>
                                )}
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Stock</Typography>
                                  <Typography variant="body2" fontWeight={600} color={offer.stock > 0 ? '#374151' : '#ef4444'}>
                                    {offer.stock !== undefined ? offer.stock : 'N/A'}
                                  </Typography>
                                </Box>
                                {offer.sku && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">SKU</Typography>
                                    <Typography variant="body2" fontFamily="monospace">{offer.sku}</Typography>
                                  </Box>
                                )}
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Returnable</Typography>
                                  <Typography variant="body2">{offer.isReturnable ? `✅ Yes (${offer.returnTAT})` : '❌ No'}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Offer Status</Typography>
                                  <Chip
                                    label={offer.approvalStatus || 'PENDING'}
                                    size="small"
                                    sx={{
                                      ml: 0.5, height: 18, fontSize: 10,
                                      bgcolor: offer.approvalStatus === 'APPROVED' ? '#dcfce7' : offer.approvalStatus === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                                      color: offer.approvalStatus === 'APPROVED' ? '#15803d' : offer.approvalStatus === 'REJECTED' ? '#dc2626' : '#a16207',
                                      fontWeight: 600
                                    }}
                                  />
                                </Box>
                              </Box>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>

              {selectedProduct.images?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#FF5A00' }}>Product Images</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {selectedProduct.images.map((img: string, i: number) => (
                      <Avatar
                        key={i}
                        src={img}
                        variant="rounded"
                        sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, border: '1px solid #f0f0f0', cursor: 'pointer' }}
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedProduct(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
