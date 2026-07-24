import { Route, Routes } from "react-router-dom";

import HomePage from "../seller/pages/SellerDashboard/HomePage";
import Products from "../seller/pages/Products/Products";
import ProductForm from "../seller/pages/Products/AddProductForm";
import Orders from "../seller/pages/Orders/Orders";
import SellerReturnsList from "../seller/pages/Orders/SellerReturnsList";
import ReplacementsPage from "../seller/pages/Orders/ReplacementsPage";
import Profile from "../seller/pages/Account/Profile";
import Payment from "../seller/pages/Payment/Payment";
import TransactionTable from "../seller/pages/Payment/TransactionTable";
import Stock from "../seller/pages/Stock/Stock";
import Enquiry from "../seller/pages/Enquiry/Enquiry";
import Chats from "../seller/pages/Chats/Chats";

// ✅ ADD THIS IMPORT
import OfflineSale from "../seller/pages/OfflineSale/OfflineSale";

import AnalyticsDashboard from "../seller/pages/Analytics/AnalyticsDashboard";

const SellerRoutes = () => {
  return (
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
  );
};

export default SellerRoutes;