// src/customer/pages/SellerProfile/SellerProfile.tsx
import "./seller.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../../Config/Api";
import Alert from "../../../components/CustomAlert";
import CustomLoader from "../../../components/CustomLoader";
import { Box } from "@mui/material";
import { useAppDispatch } from "../../../redux/Store";
import { fetchSellerReviews } from "../../../redux/Customer/SellerReviewSlice";

import Header from "./Header";
import Products from "./Products";
import About from "./About";
import Reviews from "./Reviews";
import Policies from "./Policies";
import Contact from "./Contact";

import PullToRefresh from "../../../components/PullToRefresh";

export default function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const dispatch = useAppDispatch();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("products");

  const fetchSellerData = async () => {
    if (!sellerId) {
      setError("Seller ID not found");
      return;
    }
    setError(null);

    try {
      const res = await api.get(`/sellers/${sellerId}`);
      setSeller(res.data);
      dispatch(fetchSellerReviews({ sellerId }));
      api.patch(`/sellers/${sellerId}/view`).catch(console.error);
    } catch (err: any) {
      console.error("Failed to fetch seller:", err);
      setError(err.response?.data?.message || "Failed to load seller profile");
    }
  };

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    fetchSellerData().finally(() => setLoading(false));
  }, [sellerId]);

  const handleRefresh = async () => {
    await fetchSellerData();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CustomLoader />
      </Box>
    );
  }

  if (error || !seller) {
    return (
      <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, px: 2 }}>
        <Alert severity="error">{error || "Seller not found"}</Alert>
      </Box>
    );
  }

  const themeColor = "#FF5A00";
  const themeStyles = {
    "--sp-accent": themeColor,
    "--sp-accent-light": `color-mix(in srgb, ${themeColor} 80%, white)`,
    "--sp-accent-dark": `color-mix(in srgb, ${themeColor} 50%, black)`,
    "--sp-accent-bg": `color-mix(in srgb, ${themeColor} 12%, transparent)`,
    "--sp-accent-bg-strong": `color-mix(in srgb, ${themeColor} 20%, transparent)`,
    "--sp-accent-gradient": `linear-gradient(135deg, ${themeColor}, color-mix(in srgb, ${themeColor} 70%, white))`,
  } as React.CSSProperties;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="seller-page" style={themeStyles}>
        <Header seller={seller} activeTab={activeTab} setActiveTab={setActiveTab} />
        {(activeTab === "all" || activeTab === "products") && <Products seller={seller} />}
        {(activeTab === "all" || activeTab === "about") && <About seller={seller} />}
        {(activeTab === "all" || activeTab === "reviews") && <Reviews seller={seller} />}
        {(activeTab === "all" || activeTab === "policies") && <Policies seller={seller} />}
        {(activeTab === "all" || activeTab === "contact") && <Contact seller={seller} />}
      </div>
    </PullToRefresh>
  );
}