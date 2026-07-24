import React, { useState } from "react";
import { api } from "../../../Config/Api";
import { useAppSelector } from "../../../redux/Store";
import ChatModal from "./ChatModal";
import { Snackbar, Alert, Button } from "@mui/material";

interface HeaderProps {
  seller: any;
  activeTab: string;
  setActiveTab: any;
}

export default function Header({ seller, activeTab, setActiveTab }: HeaderProps) {
  const auth = useAppSelector(state => state.auth);
  
  /* NEW */
  const [isFollowing, setIsFollowing] = useState(() => {
    return auth.user?.followedSellers?.includes(seller?._id) || false;
  });

  React.useEffect(() => {
    if (auth.user?.followedSellers && seller?._id) {
      setIsFollowing(auth.user.followedSellers.includes(seller._id));
    }
  }, [auth.user?.followedSellers, seller?._id]);

  const businessName = seller?.businessDetails?.businessName || seller?.sellerName || "Seller";
  const logo = seller?.businessDetails?.logo || "/seller.png";
  const district = seller?.district || "Unknown";
  const joined = seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "";
  const themeColor = seller?.storefront?.themeColor || "#1976d2";
  const isHolidayMode = seller?.storefront?.holidayMode;
  const promotions = seller?.storefront?.promotions || [];
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const handleFollow = async () => {
    if (!auth.jwt) {
      setSnackbarMessage("Please login to follow this seller.");
      setSnackbarOpen(true);
      return;
    }
    try {
      const action = isFollowing ? "unfollow" : "follow";
      await api.patch(`/sellers/${seller._id}/follow`, { action }, {
        headers: { Authorization: `Bearer ${auth.jwt}` }
      });
      setIsFollowing(!isFollowing);
      if (seller.performanceMetrics) {
        seller.performanceMetrics.followersCount = (seller.performanceMetrics.followersCount || 0) + (isFollowing ? -1 : 1);
      }
    } catch (err) {
      console.error("Failed to follow seller", err);
    }
  };

  const sellerReviewState = useAppSelector((state) => state.sellerReview);
  const realReviewCount = sellerReviewState.reviewsBySeller[seller?._id]?.length;
  const displayReviewCount = realReviewCount !== undefined ? realReviewCount : (seller?.totalReviews || 0);

  return (
    <header className="profile-header">
      {/* HOLIDAY MODE BANNER */}
      {isHolidayMode && (
        <div style={{ backgroundColor: "#ff9800", color: "#fff", padding: "10px", textAlign: "center", fontWeight: "bold" }}>
          🏖️ This seller is currently on holiday. Orders may experience a delay in shipping.
        </div>
      )}

      {/* PROMOTIONS */}
      {promotions.length > 0 && (
        <div style={{ backgroundColor: themeColor, color: "#fff", padding: "10px", textAlign: "center", fontWeight: "bold", fontSize: "14px" }}>
          {promotions.map((promo: string, index: number) => (
            <div key={index}>🏷️ {promo}</div>
          ))}
        </div>
      )}
      
      {/* COVER */}
      <div className="cover-wrapper">
        <img
          src={seller?.businessDetails?.banner || "/cover.png"}
          className="cover-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/cover.png";
          }}
        />
        <div className="cover-overlay"></div>
      </div>

      {/* PROFILE INFO CARD (GLASSMORPHISM) */}
      <div className="profile-info-card">
        <div className="profile-avatar-wrap">
          <img src={logo} className="profile-avatar" />
        </div>

        <div className="profile-details">
          <h1 className="seller-name">{businessName}</h1>
          <p className="seller-email">{seller?.email}</p>

          <div className="seller-meta">
            <span>📍 {district}</span>
            <span>📞 {seller?.mobile}</span>
          </div>

          <div className="seller-actions">
            <button 
              className={`action-btn ${!isFollowing ? 'primary-btn' : ''}`}
              style={isFollowing ? {} : { backgroundColor: themeColor }}
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "+ Follow"}
              <span style={{ fontSize: "11px", opacity: 0.9 }}>
                ({seller?.performanceMetrics?.followersCount || 0})
              </span>
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                if (!auth.jwt) {
                  setSnackbarMessage("Please login to message this seller.");
                  setSnackbarOpen(true);
                  return;
                }
                setIsChatOpen(true);
              }}
            >
              💬 Message
            </button>
            <button
              className="action-btn"
              onClick={() => {
                let url = "";
                if (seller?.location?.coordinates && seller.location.coordinates.length === 2) {
                  const [lng, lat] = seller.location.coordinates;
                  url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                } else if (seller?.businessDetails?.businessAddress) {
                  url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller.businessDetails.businessAddress)}`;
                } else if (seller?.district) {
                  url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller.district)}`;
                }
                if (url) window.open(url, "_blank");
              }}
            >
              📍 Map
            </button>
            <button
              className="action-btn"
              onClick={() => {
                const shareUrl = window.location.href;
                const message = `Check out ${businessName} seller profile 👇\n\n${shareUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
              }}
            >
              ↗ Share
            </button>
          </div>
        </div>
      </div>

      <nav className="profile-nav-wrap">
        <button
          onClick={() => setActiveTab("products")}
          className={`profile-nav-btn ${activeTab === "products" ? "active" : ""}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`profile-nav-btn ${activeTab === "about" ? "active" : ""}`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`profile-nav-btn ${activeTab === "reviews" ? "active" : ""}`}
        >
          Reviews {displayReviewCount > 0 ? `(${displayReviewCount})` : ""}
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`profile-nav-btn ${activeTab === "policies" ? "active" : ""}`}
        >
          Policies
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`profile-nav-btn ${activeTab === "contact" ? "active" : ""}`}
        >
          Contact
        </button>
      </nav>

      {isChatOpen && (
        <ChatModal 
          sellerId={seller._id} 
          sellerName={businessName} 
          themeColor={themeColor}
          onClose={() => setIsChatOpen(false)} 
        />
      )}

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="warning" 
          sx={{ width: '100%', borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setSnackbarOpen(false);
                window.dispatchEvent(new Event('open-login-modal'));
              }}
            >
              Login
            </Button>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </header>
  );
}