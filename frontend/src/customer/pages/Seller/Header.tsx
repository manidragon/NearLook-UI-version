import React, { useState } from "react";
import { api } from "../../../Config/Api";
import { useAppSelector } from "../../../redux/Store";
import ChatModal from "./ChatModal";
import { Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

interface HeaderProps {
  seller: any;
  activeTab: string;
  setActiveTab: any;
}

const optimizeCloudinaryUrl = (url?: string, width = 1000) => {
  if (url && url.includes('res.cloudinary.com') && !url.includes('f_auto')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
};

export default function Header({ seller, activeTab, setActiveTab }: HeaderProps) {
  const { user } = useAppSelector(state => state.user);
  const auth = useAppSelector(state => state.auth);
  
  /* NEW */
  const [isFollowing, setIsFollowing] = useState(() => {
    return user?.followedSellers?.includes(seller?._id) || false;
  });

  React.useEffect(() => {
    if (user?.followedSellers && seller?._id) {
      setIsFollowing(user.followedSellers.includes(seller._id));
    }
  }, [user?.followedSellers, seller?._id]);

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
  
  const [followersCount, setFollowersCount] = useState(() => seller?.performanceMetrics?.followersCount || 0);
  const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);

  React.useEffect(() => {
    if (seller?.performanceMetrics?.followersCount !== undefined) {
      setFollowersCount(seller.performanceMetrics.followersCount);
    }
  }, [seller?.performanceMetrics?.followersCount]);

  const handleFollow = async () => {
    if (!auth.jwt) {
      setSnackbarMessage("Please login to follow this seller.");
      setSnackbarOpen(true);
      return;
    }
    
    // If currently following, prompt for confirmation instead of immediate unfollow
    if (isFollowing) {
      setUnfollowDialogOpen(true);
      return;
    }
    
    // Otherwise, follow immediately
    executeFollowChange("follow");
  };

  const executeFollowChange = async (action: "follow" | "unfollow") => {
    try {
      await api.patch(`/sellers/${seller._id}/follow`, { action }, {
        headers: { Authorization: `Bearer ${auth.jwt}` }
      });
      setIsFollowing(action === "follow");
      setFollowersCount((prev: number) => Math.max(0, prev + (action === "follow" ? 1 : -1)));
    } catch (err) {
      console.error("Failed to change follow status", err);
    } finally {
      setUnfollowDialogOpen(false);
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
        <div className="relative w-full z-20 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Dynamic modern background */}
          <div 
            className="absolute inset-0 opacity-95"
            style={{
              background: `linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)`
            }}
          ></div>
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 60%)`
            }}
          ></div>
          
          <div className="absolute inset-0 backdrop-blur-md"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base font-medium text-white">
              {promotions.map((promo: string, index: number) => (
                <div 
                  key={index} 
                  className="group relative flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 cursor-default backdrop-blur-lg"
                >
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{ boxShadow: `0 0 20px ${themeColor}40` }}>
                  </div>
                  
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 shadow-sm">
                    <span className="animate-pulse text-[10px]">🔥</span>
                  </div>
                  <span className="relative tracking-wide text-[0.9rem] font-medium text-slate-50 drop-shadow-md">{promo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* COVER */}
      <div className="cover-wrapper">
        <img
          src={optimizeCloudinaryUrl(seller?.businessDetails?.banner, 1200) || "/cover.png"}
          alt="Seller Cover"
          className="cover-image"
          fetchPriority="high"
          width="1200"
          height="300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/cover.png";
          }}
        />
        <div className="cover-overlay"></div>
      </div>

      {/* PROFILE INFO CARD (GLASSMORPHISM) */}
      <div className="profile-info-card">
        <div className="profile-avatar-wrap">
          <img src={optimizeCloudinaryUrl(logo, 200)} alt="Seller Avatar" width="120" height="120" className="profile-avatar" />
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
                ({Math.max(0, followersCount)})
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

      <Snackbar open={snackbarOpen} 
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

      {/* Unfollow Confirmation Dialog */}
      <Dialog
        open={unfollowDialogOpen}
        onClose={() => setUnfollowDialogOpen(false)}
        aria-labelledby="unfollow-dialog-title"
        aria-describedby="unfollow-dialog-description"
        PaperProps={{
          sx: { borderRadius: '12px', padding: '8px' }
        }}
      >
        <DialogTitle id="unfollow-dialog-title" sx={{ fontWeight: 'bold' }}>
          Unfollow {businessName}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unfollow-dialog-description">
            Are you sure you want to unfollow this seller? You will no longer receive their updates in your feed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingRight: '20px', paddingBottom: '16px' }}>
          <Button onClick={() => setUnfollowDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={() => executeFollowChange("unfollow")} 
            color="error" 
            variant="contained" 
            disableElevation
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          >
            Unfollow
          </Button>
        </DialogActions>
      </Dialog>
    </header>
  );
}