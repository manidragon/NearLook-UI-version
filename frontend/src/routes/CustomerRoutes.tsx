import React, { Suspense, useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/Store'
import { fetchUserCart } from '../redux/Customer/CartSlice'
import { getWishlistByUserId } from '../redux/Customer/WishlistSlice'

import GlobalBreadcrumbs from '../components/GlobalBreadcrumbs'
import { Box } from '@mui/material';
import CustomLoader from "../components/CustomLoader";

// Lazy loaded components for better performance
const Navbar = React.lazy(() => import('../customer/components/Navbar/Navbar'))
const Footer = React.lazy(() => import('../customer/components/Footer/Footer'))

// Lazy loaded components for better performance
const Home = React.lazy(() => import('../customer/pages/Home/Home'))
const Products = React.lazy(() => import('../customer/pages/Products/Products'))
const ProductDetails = React.lazy(() => import('../customer/pages/Products/ProductDetails/ProductDetails'))
const Cart = React.lazy(() => import('../customer/pages/Cart/Cart'))
const Address = React.lazy(() => import('../customer/pages/Checkout/AddressPage'))
const Profile = React.lazy(() => import('../customer/pages/Account/Profile'))
const NotFound = React.lazy(() => import('../customer/pages/NotFound/NotFound'))
const PaymentSuccessHandler = React.lazy(() => import('../customer/pages/Payment/PaymentSuccessHandler'))
const Reviews = React.lazy(() => import('../customer/pages/Review/Reviews'))
const WriteReviews = React.lazy(() => import('../customer/pages/Review/WriteReview'))
const Wishlist = React.lazy(() => import('../customer/pages/Wishlist/Wishlist'))
const SearchProducts = React.lazy(() => import('../customer/pages/Search/SearchProducts'))

// Public seller profile page (customer-facing)
const SellerProfile = React.lazy(() => import('../customer/pages/Seller/SellerProfile'))
const MapSearch = React.lazy(() => import('../customer/pages/MapSearch/MapSearch'))
const MobileCategories = React.lazy(() => import('../customer/pages/MobileCategories/MobileCategories'))
const TermsAndConditions = React.lazy(() => import('../customer/pages/Legal/TermsAndConditions'))
const PrivacyPolicy = React.lazy(() => import('../customer/pages/Legal/PrivacyPolicy'))
const RefundPolicy = React.lazy(() => import('../customer/pages/Legal/RefundPolicy'))
const ShippingPolicy = React.lazy(() => import('../customer/pages/Legal/ShippingPolicy'))
const ContactUs = React.lazy(() => import('../customer/pages/Legal/ContactUs'))

// Customer writes a review for a seller (after delivery)
const SellerReviewForm = React.lazy(() => import('../customer/pages/Review/SellerReviewForm'))

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const jwt = localStorage.getItem("jwt");
  const location = useLocation();

  if (!jwt) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

const LazyFooter = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{isVisible && <Footer />}</div>;
};

const CustomerRoutes = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const location = useLocation();

  const chat = useAppSelector(state => state.chat);
  const isChatActive = location.pathname.includes('/account/chats') && chat?.currentChat !== null;
  const isMobileCategoriesPage = location.pathname === '/mobile-categories';

  useEffect(() => {
    const jwt = auth.jwt || "";
    if (jwt && auth.role === "ROLE_CUSTOMER") {
      dispatch(fetchUserCart(jwt));
      dispatch(getWishlistByUserId(jwt));
    }
  }, [auth.jwt, auth.role, dispatch]);

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white w-full border-b" />}>
        <Navbar />
      </Suspense>
      <GlobalBreadcrumbs />
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CustomLoader sx={{ color: '#FF5A00' }} />
        </Box>
      }>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products/:categoryId' element={<Products />} />
          <Route path='/search-products' element={<SearchProducts />} />
          <Route path='/reviews/:productId' element={<Reviews />} />
          <Route path='/reviews/:productId/create' element={<ProtectedRoute><WriteReviews /></ProtectedRoute>} />
          <Route path='/product-details/:categoryId/:name/:productId' element={<ProductDetails />} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path='/checkout/address' element={<ProtectedRoute><Address /></ProtectedRoute>} />
          <Route path='/account/*' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/payment-success' element={<ProtectedRoute><PaymentSuccessHandler /></ProtectedRoute>} />

          {/* ✅ Public seller profile — navigated to from ProductDetails seller name click */}
          <Route path='/seller-profile/:sellerId' element={<SellerProfile />} />

          {/* ✅ Customer writes a seller review from OrderDetails */}
          <Route path='/account/seller-review/:sellerId' element={<ProtectedRoute><SellerReviewForm /></ProtectedRoute>} />

          <Route path='/explore-nearby' element={<MapSearch />} />
          <Route path='/mobile-categories' element={<MobileCategories />} />
          
          <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/refund-policy' element={<RefundPolicy />} />
          <Route path='/shipping-policy' element={<ShippingPolicy />} />
          <Route path='/contact-us' element={<ContactUs />} />

          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isMobileCategoriesPage && (
        <Suspense fallback={<div className="h-[200px] bg-gray-900 w-full" />}>
          <LazyFooter />
        </Suspense>
      )}
      {/* Spacer to prevent mobile bottom navigation from hiding final content */}
      {!isChatActive && (
        <div className="h-[65px] lg:hidden w-full" aria-hidden="true"></div>
      )}
    </>
  )
}

export default CustomerRoutes;