import Alert from "../../../components/CustomAlert";
import { Snackbar, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Order from './Order';
import UserDetails from './UserDetails';
import SavedCards from './SavedCards';
import OrderDetails from './OrderDetails';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import Addresses from './Adresses';
import ProfileNavigation from './ProfileNavigation';
import WalletBalance from '../../components/Wallet/WalletBalance';
import CustomerChats from './CustomerChats';
import FollowedSellersProducts from './FollowedSellersProducts';


const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(state => state.orders);
  const user = useAppSelector(state => state.user);
  const [snackbarOpen, setOpenSnackbar] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRootAccount = location.pathname === '/account' || location.pathname === '/account/';

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (user.profileUpdated || orders.orderCanceled || user.error) {
      setOpenSnackbar(true);
    }
  }, [user.profileUpdated, orders.orderCanceled, user.error]);

  const chat = useAppSelector(state => state.chat);
  const isChatActive = location.pathname.includes('/account/chats') && chat.currentChat !== null;

  return (
    <div className={`bg-[#F1F3F6] min-h-[100dvh] ${isChatActive && isMobile ? 'p-0 h-[100dvh] overflow-hidden' : 'py-4 md:py-8 px-2 sm:px-10 md:px-10 lg:px-20 xl:px-60 pb-[80px] md:pb-8'}`}>
      <div className='flex flex-col md:flex-row gap-6 items-start h-full'>
        
        {(!isMobile || isRootAccount) && <ProfileNavigation />}

        {/* Main Content - responsive width */}
        {(!isMobile || !isRootAccount) && (
          <div className={`w-full ${!isMobile ? 'md:w-[70%] lg:w-[80%]' : ''} bg-white shadow-sm rounded-sm overflow-hidden relative ${isChatActive && isMobile ? 'h-full' : 'min-h-[500px]'}`}>
            
            {/* Mobile Back Button for sub-pages */}
            {isMobile && !isRootAccount && !isChatActive && (
              <div 
                onClick={() => navigate('/account')} 
                className="flex items-center gap-2 p-4 bg-white border-b border-gray-100 cursor-pointer"
              >
                <span className="text-[#c24100] font-bold">← Back to Menu</span>
              </div>
            )}

            <Routes>
              <Route path='/' element={<UserDetails />} />
              <Route path='/orders' element={<Order />} />
              <Route path='/orders/:orderId/item/:orderItemId' element={<OrderDetails />} />
              <Route path='/profile' element={<UserDetails />} />
              <Route path='/saved-card' element={<SavedCards />} />
              <Route path='/addresses' element={<Addresses />} />
              <Route path='/chats' element={<CustomerChats />} />
              <Route path='/following' element={<FollowedSellersProducts />} />
              <Route
                path='/wallet'
                element={
                  <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
                    <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                      💳 My Wallet
                    </Typography>
                    <WalletBalance compact={false} />
                  </Box>
                }
              />
            </Routes>
          </div>
        )}

      </div>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={user.error ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {user.error
            ? user.error
            : orders.orderCanceled
              ? "Order canceled successfully"
              : "Profile updated successfully"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;