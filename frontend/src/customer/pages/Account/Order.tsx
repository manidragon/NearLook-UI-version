// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\Order.tsx

import { useEffect, useState } from 'react';
import Alert from "../../../components/CustomAlert";
import CustomLoader from "../../../components/CustomLoader";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import OrderItemCard from './OrderItemCard';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchUserOrderHistory } from '../../../redux/Customer/OrderSlice';

const Order = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const orders = useAppSelector(state => state.orders);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(fetchUserOrderHistory(jwt));
    }
  }, [auth.jwt, dispatch]);

  // ✅ FIX 1: Safe orders array with fallback
  const ordersList = orders?.orders || [];

  // ✅ FIX 2: Safe filtering with null checks
  const selfPickupOrders = ordersList.filter(order => 
    order?.fulfillmentType === 'SELF_PICKUP'
  );
  const deliveryOrders = ordersList.filter(order => 
    order?.fulfillmentType === 'DELIVERY' || !order?.fulfillmentType // Default to delivery
  );

  // ✅ FIX 3: Render order items with proper key and null checks
  const renderOrderItems = (orderList: any[]) => {
    return orderList.flatMap(order => {
      // Skip invalid orders
      if (!order?._id || !Array.isArray(order.orderItems)) {
        console.warn('⚠️ Skipping invalid order:', order?._id);
        return [];
      }
      
      return order.orderItems.map((item: any) => {
        // ✅ Use composite key: order._id + item._id for uniqueness
        const uniqueKey = `${order._id}-${item._id || 'unknown'}`;
        
        return (
          <OrderItemCard 
            key={uniqueKey}  // ✅ FIX: Proper unique key
            item={item} 
            order={order} 
          />
        );
      });
    });
  };

  // ✅ FIX 4: Loading state
  if (orders.loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <CustomLoader />
        <Typography sx={{ mt: 2 }}>Loading your orders...</Typography>
      </Box>
    );
  }

  // ✅ FIX 5: Error state
  if (orders.error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {orders.error}
      </Alert>
    );
  }

  // ✅ FIX 6: Empty state with helpful message
  if (ordersList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" color="text.secondary">
          No orders yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Start shopping to see your orders here
        </Typography>
      </Box>
    );
  }

  return (
    <div className='min-h-[100dvh] pb-20 lg:pb-6 bg-[#F1F3F6] lg:bg-white'>
      {/* Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 2, 
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        px: 2
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { py: 2, fontWeight: 600 },
            '& .Mui-selected': { color: '#FF5A00 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#FF5A00' }
          }}
        >
          <Tab label="Delivery" />
          <Tab label="Pickup" />
        </Tabs>
      </Box>

      {/* Content */}
      <div className='px-2 lg:px-4 space-y-3 lg:space-y-4'>
        {tabValue === 0 && (
          deliveryOrders.length > 0 ? renderOrderItems(deliveryOrders) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">You have no delivery orders.</Typography>
            </Box>
          )
        )}
        {tabValue === 1 && (
          selfPickupOrders.length > 0 ? renderOrderItems(selfPickupOrders) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">You have no self pickup orders.</Typography>
            </Box>
          )
        )}
      </div>
    </div>
  );
};

export default Order;