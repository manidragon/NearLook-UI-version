import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const HomePage = lazy(() => import("../seller/pages/SellerDashboard/HomePage"));
const Products = lazy(() => import("../seller/pages/Products/Products"));
const ProductForm = lazy(() => import("../seller/pages/Products/AddProductForm"));
const Orders = lazy(() => import("../seller/pages/Orders/Orders"));
const SellerReturnsList = lazy(() => import("../seller/pages/Orders/SellerReturnsList"));
const ReplacementsPage = lazy(() => import("../seller/pages/Orders/ReplacementsPage"));
const Profile = lazy(() => import("../seller/pages/Account/Profile"));
const Payment = lazy(() => import("../seller/pages/Payment/Payment"));
const Stock = lazy(() => import("../seller/pages/Stock/Stock"));
const Enquiry = lazy(() => import("../seller/pages/Enquiry/Enquiry"));
const Chats = lazy(() => import("../seller/pages/Chats/Chats"));
const OfflineSale = lazy(() => import("../seller/pages/OfflineSale/OfflineSale"));
const AnalyticsDashboard = lazy(() => import("../seller/pages/Analytics/AnalyticsDashboard"));

const FallbackLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
    <CircularProgress sx={{ color: '#FF5A00' }} />
  </Box>
);

const SellerRoutes = () => {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />

        <Route path="/products" element={<Products />} />
        <Route path="/add-product" element={<ProductForm />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/returns" element={<SellerReturnsList />} />
        <Route path="/replacements" element={<ReplacementsPage />} />

        {/* ✅ OFFLINE SALE ROUTE */}
        <Route path="/offline-sale" element={<OfflineSale />} />

        <Route path="/account" element={<Profile />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/transaction" element={<Payment />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/enquiries" element={<Enquiry />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
    </Suspense>
  );
};

export default SellerRoutes;