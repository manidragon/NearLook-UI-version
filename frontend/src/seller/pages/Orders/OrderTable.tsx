// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Orders\OrderTable.tsx

import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from "../../../components/NeonButton";
import { Box, Menu, MenuItem, styled, Chip, Typography, Tabs, Tab, FormControl, InputLabel, Select } from "@mui/material";

import ScheduleIcon from '@mui/icons-material/Schedule';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchSellerOrders, updateOrderStatus } from '../../../redux/Seller/sellerOrderSlice';
import { type Order, type OrderItem } from '../../../types/orderTypes';
import dayjs from 'dayjs';

type OrderStatus = 
  | 'PENDING'
  | 'PLACED' 
  | 'READY_FOR_PICKUP'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'CANCELLED';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
    padding: '16px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: '1px solid #f1f5f9',
    padding: '16px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#ffffff',
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'background-color 0.2s ease',
}));

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
};

const getProductImage = (orderItem: OrderItem): string => {
  const product = orderItem?.product;
  if (!product) return 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
  if (product.variants && orderItem.variantId) {
    const variant = product.variants.find((v: any) => String(v._id) === String(orderItem.variantId));
    if (variant?.images?.[0]) return variant.images[0];
  }
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.variants?.[0]?.images?.[0]) return product.variants[0].images[0];
  return 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
};

const getVariantSpecs = (orderItem: OrderItem): { label: string; value: string }[] => {
  const specs: { label: string; value: string }[] = [];
  const product = orderItem?.product;
  
  if (!product) return [];
  
  // Strategy 1: Match by variantId
  if (product.variants && orderItem.variantId) {
    const variant = product.variants.find((v: any) => 
      String(v._id) === String(orderItem.variantId)
    );
    
    if (variant?.specifications) {
      Object.entries(variant.specifications).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());
          specs.push({ label, value: String(value) });
        }
      });
      
      if (specs.length > 0) {
        // ✅ SORT specs for stable order (prevents flicker)
        return specs.sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    
    if (variant?.color) {
      return [{ label: 'Color', value: variant.color }];
    }
  }
  
  // Strategy 2: Match by color (fallback)
  if (product.variants && orderItem?.size) {
    const matchingVariant = product.variants.find((v: any) => 
      v.color?.toLowerCase() === orderItem.size.toLowerCase()
    );
    
    if (matchingVariant?.specifications) {
      Object.entries(matchingVariant.specifications).forEach(([key, value]) => {
        if (value && String(value).trim()) {
          const label = key
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());
          specs.push({ label, value: String(value) });
        }
      });
      
      if (specs.length > 0) {
        // ✅ SORT specs for stable order
        return specs.sort((a, b) => a.label.localeCompare(b.label));
      }
    }
  }
  
  // Strategy 3: Use size field
  if (orderItem.size && orderItem.size !== 'Default') {
    return [{ label: 'Variant', value: orderItem.size }];
  }
  
  return [];
};

const orderStatusColor: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#FFA500', label: 'Pending' },
  PLACED: { color: '#F5BCBA', label: 'Ordered' },
  CONFIRMED: { color: '#FFA500', label: 'Packed / Confirmed' },
  READY_FOR_PICKUP: { color: '#FF8C00', label: 'Ready for Pickup' },
  SHIPPED: { color: '#1E90FF', label: 'Shipped' },
  ARRIVING: { color: '#1E90FF', label: 'Out for Delivery' },
  DELIVERED: { color: '#32CD32', label: 'Delivered / Picked Up' },
  CANCELLED: { color: '#FF0000', label: 'Cancelled' }
};

interface StatusOption {
  color: string;
  label: string;
  value: string;
}

const deliveryOrderStatus: StatusOption[] = [
  { color: '#F5BCBA', label: 'Ordered', value: 'PLACED' },
  { color: '#FFA500', label: 'Packed', value: 'CONFIRMED' },
  { color: '#1E90FF', label: 'Shipped', value: 'SHIPPED' },
  { color: '#1E90FF', label: 'Out for Delivery', value: 'ARRIVING' },
  { color: '#32CD32', label: 'Delivered', value: 'DELIVERED' },
  { color: '#FF0000', label: 'Cancelled', value: 'CANCELLED' },
];

const pickupOrderStatus: StatusOption[] = [
  { color: '#F5BCBA', label: 'Ordered', value: 'PLACED' },
  { color: '#FFA500', label: 'Confirmed', value: 'CONFIRMED' },
  { color: '#FF8C00', label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { color: '#32CD32', label: 'Picked Up', value: 'DELIVERED' },
  { color: '#FF0000', label: 'Cancelled', value: 'CANCELLED' },
];

const filterOrderStatus: StatusOption[] = [
  { color: '#FFA500', label: 'Pending', value: 'PENDING' },
  { color: '#F5BCBA', label: 'Ordered', value: 'PLACED' },
  { color: '#FFA500', label: 'Packed / Confirmed', value: 'CONFIRMED' },
  { color: '#1E90FF', label: 'Shipped', value: 'SHIPPED' },
  { color: '#1E90FF', label: 'Out for Delivery', value: 'ARRIVING' },
  { color: '#FF8C00', label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { color: '#32CD32', label: 'Delivered / Picked Up', value: 'DELIVERED' },
  { color: '#FF0000', label: 'Cancelled', value: 'CANCELLED' }
];

interface OrderRowProps {
  item: Order;
  anchorEl: { [key: string]: HTMLElement | null };
  onStatusClick: (event: React.MouseEvent<HTMLElement>, orderId: string) => void;
  onStatusClose: (orderId: string) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isSelfPickupTable: boolean;
}

const OrderRow: React.FC<OrderRowProps> = React.memo(({ 
  item, 
  anchorEl, 
  onStatusClick, 
  onStatusClose, 
  onStatusUpdate,
  isSelfPickupTable 
}) => {
  const statusConfig = orderStatusColor[item.orderStatus as keyof typeof orderStatusColor];
  const statusColor = statusConfig?.color || '#999';
  
  return (
    <StyledTableRow key={item._id}>
      <StyledTableCell align="left">{item._id?.slice(-8) || 'N/A'}</StyledTableCell>
      
      {/* Products Column */}
      <StyledTableCell component="th" scope="row">
        <div className='flex gap-1 flex-wrap'>
          {item.orderItems?.map((orderItem: OrderItem) => {
            const imageUrl = getProductImage(orderItem);
            const productTitle = orderItem.product?.title || 'Product';
            const specs = getVariantSpecs(orderItem);
            
            return (
              <div key={orderItem._id} className='flex gap-3 mb-2'>
                <img 
                  className='w-20 h-20 object-cover rounded-md border' 
                  src={imageUrl} 
                  alt={productTitle}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className='flex flex-col justify-between py-1'>
                  <Typography variant="body2" fontWeight="medium">{productTitle}</Typography>
                  {specs.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {specs.map((spec, idx) => (
                        <Chip 
                          key={`${spec.label}-${idx}-${orderItem._id}`}
                          label={`${spec.label}: ${spec.value}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                    </div>
                  )}
                  <Typography variant="caption" color="text.secondary" className='mt-1'>
                    Qty: {orderItem.quantity || 1} • ₹{(orderItem.sellingPrice || 0).toFixed(0)}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </StyledTableCell>
      
      {/* ✅ Shipping Address Column - Only show for Delivery Orders */}
      {!isSelfPickupTable && (
        <StyledTableCell>
          <div className='flex flex-col gap-y-1 text-xs'>
            <Typography variant="body2">{item.shippingAddress?.name || 'N/A'}</Typography>
            <Typography variant="body2">
              {item.shippingAddress?.address || 'N/A'}, {item.shippingAddress?.city || 'N/A'}
            </Typography>
            <Typography variant="body2">
              {item.shippingAddress?.state || 'N/A'} - {item.shippingAddress?.pinCode || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Mobile:</strong> {item.shippingAddress?.mobile || 'N/A'}
            </Typography>
          </div>
        </StyledTableCell>
      )}

      {/* Pickup Time Column (Self Pickup tables only) */}
      {isSelfPickupTable && (
        <StyledTableCell align="center">
          {item.pickupTime ? (
            <Box className='bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs'>
              {formatDateTime(item.pickupTime)}
            </Box>
          ) : (
            <Box className='bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs'>
              Not Scheduled
            </Box>
          )}
        </StyledTableCell>
      )}

      {/* Order Status */}
      <StyledTableCell align="center">
        <Box 
          sx={{ 
            borderColor: statusColor,
            color: statusColor 
          }}
          className='border px-2 py-1 rounded-full text-xs whitespace-nowrap text-center inline-block'
        >
          {statusConfig?.label || item.orderStatus}
        </Box>
      </StyledTableCell>
      
      {/* Status Update Button + Menu */}
      <StyledTableCell align="right">
        <Button
          size='small'
          onClick={(e) => onStatusClick(e, item._id)}
          color='primary'
          disabled={item.orderStatus === 'CANCELLED'}
          className={`${item.orderStatus === 'CANCELLED' ? 'opacity-50 cursor-not-allowed' : ''}`}
          sx={{ textTransform: 'none' }}
        >
          Status
        </Button>
        <Menu
          id={`basic-menu-${item._id}`}
          anchorEl={anchorEl[String(item._id)] || null}
          open={Boolean(anchorEl[String(item._id)])}
          onClose={() => onStatusClose(String(item._id))}
          MenuListProps={{ 'aria-labelledby': `basic-button-${item._id}` }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {(isSelfPickupTable ? pickupOrderStatus : deliveryOrderStatus).map((status) => (
            <MenuItem 
              key={status.value} 
              onClick={() => onStatusUpdate(String(item._id), status.value)}
              disabled={item.orderStatus === status.value}
            >
              {status.label}
            </MenuItem>
          ))}
        </Menu>
      </StyledTableCell>
    </StyledTableRow>
  );
});

OrderRow.displayName = 'OrderRow';

export default function OrderTable() {
  const sellerOrder = useAppSelector(state => state.sellerOrder);
  const dispatch = useAppDispatch();

  // ✅ Use useMemo for anchorEl to prevent recreation
  const [anchorEl, setAnchorEl] = React.useState<{ [key: string]: HTMLElement | null }>({});
  
  // ✅ Tab state
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // ✅ useCallback for handlers (prevents recreation on every render)
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setAnchorEl((prev) => ({ ...prev, [orderId]: event.currentTarget }));
  }, []);

  const handleClose = React.useCallback((orderId: string) => {
    setAnchorEl((prev) => ({ ...prev, [orderId]: null }));
  }, []);

 const handleUpdateOrder = React.useCallback(
  (orderId: string, newStatus: string) => {  // ✅ Use plain string
    dispatch(updateOrderStatus({
      jwt: localStorage.getItem("jwt") || "",
      orderId,
      orderStatus: newStatus as any,  // ✅ Assertion to satisfy action creator
    }));
    handleClose(orderId);
  }, 
  [dispatch, handleClose]
);

  React.useEffect(() => {
    dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
  }, [dispatch]);

  // ✅ Filter & Sort state
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [sortOrder, setSortOrder] = React.useState<'NEW_TO_OLD' | 'OLD_TO_NEW'>('NEW_TO_OLD');

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortOrder(event.target.value as 'NEW_TO_OLD' | 'OLD_TO_NEW');
  };

  // ✅ Filter & Sort logic
  const filteredAndSortedOrders = React.useMemo(() => {
    let result = [...sellerOrder.orders];

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(order => order.orderStatus === statusFilter);
    }

    // Sort by date
    result.sort((a, b) => {
      // Get timestamp from createdAt or extract from MongoDB ObjectId
      const getTimestamp = (order: Order) => {
        if ((order as any).createdAt) return new Date((order as any).createdAt).getTime();
        if (order._id) {
          const timestamp = parseInt(order._id.substring(0, 8), 16) * 1000;
          if (!isNaN(timestamp)) return timestamp;
        }
        return 0;
      };

      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);
      
      if (sortOrder === 'NEW_TO_OLD') {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
    });

    return result;
  }, [sellerOrder.orders, statusFilter, sortOrder]);

  const selfPickupOrders = React.useMemo(
    () => filteredAndSortedOrders.filter(order => order.fulfillmentType === 'SELF_PICKUP'),
    [filteredAndSortedOrders]
  );
  const deliveryOrders = React.useMemo(
    () => filteredAndSortedOrders.filter(order => order.fulfillmentType === 'DELIVERY'),
    [filteredAndSortedOrders]
  );

  // ✅ Loading state
  if (sellerOrder.loading) {
    return (
      <Box className='flex justify-center items-center py-10'>
        <Box className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></Box>
        <Typography className='ml-2'>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4'>
        <Typography variant="h5" fontWeight="bold">
          Orders Management
        </Typography>

        <Box className='flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto mt-2 sm:mt-0'>
          <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 160 } }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Filter by Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              {filterOrderStatus.map(status => (
                <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 160 } }}>
            <InputLabel id="sort-order-label">Sort By</InputLabel>
            <Select
              labelId="sort-order-label"
              id="sort-order"
              value={sortOrder}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="NEW_TO_OLD">New to Old</MenuItem>
              <MenuItem value="OLD_TO_NEW">Old to New</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          textColor="primary"
          indicatorColor="primary"
          aria-label="order tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { fontWeight: 600 } }}
        >
          <Tab label={`Delivery Orders (${deliveryOrders.length})`} />
          <Tab label={`Self Pickup Orders (${selfPickupOrders.length})`} />
        </Tabs>
      </Box>

      {/* Delivery Orders Tab Content */}
      {currentTab === 0 && (
        <Box>
          {deliveryOrders.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 900 }} aria-label="delivery orders">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Order Id</StyledTableCell>
                    <StyledTableCell>Products</StyledTableCell>
                    <StyledTableCell>Shipping Address</StyledTableCell>
                    <StyledTableCell align="right">Order Status</StyledTableCell>
                    <StyledTableCell align="right">Update</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveryOrders.map((order: Order) => (
                    <OrderRow
                      key={order._id}
                      item={order}
                      anchorEl={anchorEl}
                      onStatusClick={handleClick}
                      onStatusClose={handleClose}
                      onStatusUpdate={handleUpdateOrder}
                      isSelfPickupTable={false}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box className='text-center py-10 bg-white rounded-md shadow-sm border border-gray-100'>
              <Typography color="text.secondary">No delivery orders found</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Self Pickup Orders Tab Content */}
      {currentTab === 1 && (
        <Box>
          {selfPickupOrders.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 900 }} aria-label="self pickup orders">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Order Id</StyledTableCell>
                    <StyledTableCell>Products</StyledTableCell>
                    <StyledTableCell align="center">Pickup Time</StyledTableCell>
                    <StyledTableCell align="right">Order Status</StyledTableCell>
                    <StyledTableCell align="right">Update</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selfPickupOrders.map((order: Order) => (
                    <OrderRow
                      key={order._id}
                      item={order}
                      anchorEl={anchorEl}
                      onStatusClick={handleClick}
                      onStatusClose={handleClose}
                      onStatusUpdate={handleUpdateOrder}
                      isSelfPickupTable={true}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box className='text-center py-10 bg-white rounded-md shadow-sm border border-gray-100'>
              <Typography color="text.secondary">No self pickup orders found</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}