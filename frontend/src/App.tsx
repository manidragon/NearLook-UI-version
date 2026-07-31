// D:\Mani\Code with Zosh\Backup\source code\frontend\src\App.tsx
import './App.css';
import { ThemeProvider } from '@emotion/react';
import customeTheme from './Theme/customeTheme';
import { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import React, { Suspense } from 'react';
import { useAppDispatch, useAppSelector } from './redux/Store';
import { fetchSellerProfile } from './redux/Seller/sellerSlice';
import { fetchUserProfile, fetchUserAddresses } from './redux/Customer/UserSlice';
import { fetchUserCart as fetchCart } from './redux/Customer/CartSlice';
import { getWishlistByUserId as fetchWishlist } from './redux/Customer/WishlistSlice';
import { createHomeCategories } from './redux/Customer/Customer/AsyncThunk';
import { homeCategories } from './data/homeCategories';
import { Box } from '@mui/material';
import CustomLoader from "./components/CustomLoader";

// Lazy-load major route sections to drastically reduce initial bundle size
const CustomerRoutes = React.lazy(() => import('./routes/CustomerRoutes'));
const SellerDashboard = React.lazy(() => import('./seller/pages/SellerDashboard/SellerDashboard'));
const AdminDashboard = React.lazy(() => import('./admin/pages/Dashboard/Dashboard'));
const SellerAccountVerification = React.lazy(() => import('./seller/pages/SellerAccountVerification'));
const SellerAccountVerified = React.lazy(() => import('./seller/pages/SellerAccountVerified'));
const BecomeSeller = React.lazy(() => import('./customer/pages/BecomeSeller/BecomeSeller'));
const AdminAuth = React.lazy(() => import('./admin/pages/Auth/AdminAuth'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    return () => clearTimeout(timeout);
  }, [pathname]);
  return null;
};
function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth); // customer auth
  const sellerAuth = useAppSelector((state) => state.sellerAuth); // seller auth
  const user = useAppSelector((state) => state.user);
  const seller = useAppSelector((state) => state.sellers.profile);
  useEffect(() => {
    dispatch(createHomeCategories(homeCategories));
  }, [dispatch]);
  // 🔑 Fetch public data (safe)
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    // Decode and validate JWT
    const getRoleFromToken = (token: string): { role: string | null; isValid: boolean } => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          return { role: null, isValid: false }; // Expired
        }
        return {
          role: payload.role || null,
          isValid: true
        };
      } catch (error) {
        return { role: null, isValid: false }; // Invalid token
      }
    };
    const { role, isValid } = getRoleFromToken(jwt);
    if (!isValid) {
      // Clear invalid/expired token
      localStorage.removeItem("jwt");
      return;
    }
    // ✅ CRITICAL FIX: Set auth state from JWT for ALL roles (including admin)
    dispatch({
      type: 'auth/signin/fulfilled',
      payload: { jwt, role: role || "ROLE_CUSTOMER" }
    });
    // ✅ Only fetch customer data for customers, not for admin
    if (role === "ROLE_CUSTOMER") {
      dispatch(fetchUserProfile({ jwt, navigate }));
      dispatch(fetchCart(jwt));
      dispatch(fetchWishlist(jwt));
      dispatch(fetchUserAddresses());
    } else if (role === "ROLE_SELLER") {
      dispatch(fetchSellerProfile(jwt));
    }
    // ✅ No data fetching for admin - prevents 403 errors
  }, [dispatch, navigate]);
  return (
    <ThemeProvider theme={customeTheme}>
      <div className='App min-h-screen relative'>
        {/* Full Project Radial Background */}
        <div className="fixed inset-0 -z-[100] w-full h-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#FF5A00_100%)]" />
        
        <ScrollToTop />
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CustomLoader sx={{ color: '#FF5A00' }} />
          </Box>
        }>
          <Routes>
            {seller && seller.role === "ROLE_SELLER" && (
              <Route path='/seller/*' element={<SellerDashboard />} />
            )}
            {/* ✅ FIXED: Check auth.role instead of user.user?.role */}
            {auth.role === "ROLE_ADMIN" && (
              <Route path='/admin/*' element={<AdminDashboard />} />
            )}
            <Route path='/verify-seller/:otp' element={<SellerAccountVerification />} />
            <Route path='/seller-account-verified' element={<SellerAccountVerified />} />
            <Route path='/become-seller' element={<BecomeSeller />} />
            <Route path='/admin-login' element={<AdminAuth />} />
            <Route path='*' element={<CustomerRoutes />} />
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}
export default App;
