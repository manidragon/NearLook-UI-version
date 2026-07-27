import "./ProductCard.css";
import { secureUrl } from '../../../../util/secureUrl';
import React, { useState, useEffect, useMemo } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // ✅ ADD: For distance badge
import { teal } from "@mui/material/colors";
import Button from "../../../../components/NeonButton";
import { Box, Modal, IconButton, Typography, Snackbar, Alert } from "@mui/material"; // ✅ ADD: Typography, Snackbar, Alert
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../../types/productTypes";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../redux/Store";
import { addProductToWishlist, removeProductFromWishlist } from "../../../../redux/Customer/WishlistSlice";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { isWishlisted } from "../../../../util/isWishlisted";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import ChatBot from "../../ChatBot/ChatBot";
import { selectLocationFilter } from "../../../../redux/Customer/ProductSlice";
import StarIcon from '@mui/icons-material/Star';
import { Portal } from "@mui/material";

interface ProductCardProps {
  item: Product;
  categoryId?: string;
  sellerId?: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  borderRadius: ".5rem",
  boxShadow: 24,
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";
const ERROR_IMAGE = "https://via.placeholder.com/300x300?text=Image+Error";

const ProductCard: React.FC<ProductCardProps> = ({ item, categoryId, sellerId }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const wishlist = useAppSelector((state) => state.wishlist);
  // ✅ ADD: Get location filter from Redux
  const locationFilter = useAppSelector(selectLocationFilter);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showChatBot, setShowChatBot] = useState(false);

  const productImages = useMemo(() => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const firstVariantImages = item.variants[0]?.images;
      if (firstVariantImages && Array.isArray(firstVariantImages) && firstVariantImages.length > 0) {
        return firstVariantImages;
      }
    }
    return [];
  }, [item.images, item.variants]);

  // ✅ Check if product is in wishlist
  const isInWishlist = useMemo(() => {
    if (!item._id || !wishlist.wishlist) {
      return false;
    }
    return isWishlisted(wishlist.wishlist, item);
  }, [item._id, item, wishlist.wishlist]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error' | 'info'>('success');

  const handleAddWishlist = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!localStorage.getItem("jwt")) {
      setSnackbarMessage("Please login to add to wishlist");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (!item._id) {
      console.error('❌ Cannot add to wishlist: Product ID is missing');
      return;
    }

    dispatch(addProductToWishlist({ productId: item._id }));
    setSnackbarMessage("Added to wishlist");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // ✅ NEW: Handle remove from wishlist
  const handleRemoveWishlist = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!item._id) {
      console.error('❌ Cannot remove from wishlist: Product ID is missing');
      return;
    }

    dispatch(removeProductFromWishlist({ productId: item._id }));
    setSnackbarMessage("Removed from wishlist");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  useEffect(() => {
    let interval: any;
    if (isHovered && productImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImage((prevImage) => (prevImage + 1) % productImages.length);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, productImages.length]);

  const handleShowChatBot = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowChatBot(true);
  };

  const handleCloseChatBot = (e: MouseEvent) => {
    e.stopPropagation();
    setShowChatBot(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = ERROR_IMAGE;
  };

  // ✅ NEW: Format distance for display
  const formatDistance = (distance?: number): string | null => {
    if (distance === undefined || distance === null || isNaN(distance)) {
      return null;
    }

    // Distance is already in km from backend (due to distanceMultiplier: 0.001)
    if (distance < 1) {
      return '<1 km';
    }
    return `${distance.toFixed(1)} km`;
  };

  // ✅ NEW: Check if we should show distance badge
  const shouldShowDistance = useMemo(() => {
    // Show distance when:
    // 1. Location filter is active AND type is 'current' (coordinates-based)
    // 2. Product has a distance value from backend
    return (
      locationFilter?.type === 'current' &&
      typeof item.distance === 'number' &&
      !isNaN(item.distance)
    );
  }, [locationFilter, item.distance]);

  return (
    <>
      <div
        onClick={() => {
          const baseUrl = `/product-details/${categoryId}/${item.title}/${item._id}`;
          navigate(sellerId ? `${baseUrl}?sellerId=${sellerId}` : baseUrl);
        }}
        className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ✅ Distance Badge */}
        {shouldShowDistance && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold z-10 flex items-center gap-1 shadow-sm border border-orange-100">
            <LocationOnIcon sx={{ fontSize: 14 }} />
            {formatDistance(item.distance)}
          </div>
        )}

        <div className="relative w-full pt-[100%] sm:pt-[120%] bg-gray-50 flex-shrink-0 overflow-hidden">
          {productImages.length > 0 ? (
            productImages.map((image: string, index: number) => (
              <img
                key={`${image}-${index}`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src={secureUrl(image)}
                alt={`${item.title} - ${index + 1}`}
                style={{
                  opacity: index === currentImage ? 1 : 0,
                  transition: 'opacity 0.4s ease-in-out'
                }}
                onError={handleImageError}
                loading="lazy"
              />
            ))
          ) : (
            <img
              key="placeholder"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply"
              src={PLACEHOLDER_IMAGE}
              alt="No image available"
            />
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h2 className="text-gray-800 text-sm sm:text-base font-bold leading-snug line-clamp-2 min-h-[2.5rem] mb-1" title={item.title}>
            {item.title}
          </h2>
          
          {/* Average Rating - Only show if there are ratings */}
          {(item.totalReviews || item.numRatings) ? (
            <div className="flex items-center gap-1 mt-1 mb-3 bg-green-50 w-fit px-2 py-0.5 rounded-md border border-green-100">
              <span className="text-xs font-bold text-green-700">{item.averageRating ? item.averageRating.toFixed(1) : "0.0"}</span>
              <StarIcon sx={{ color: '#15803d', fontSize: '12px' }} />
              <span className="text-[10px] text-green-600 ml-1 font-medium">({item.totalReviews || item.numRatings || 0})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1 mb-3 bg-orange-50 w-fit px-2 py-0.5 rounded-md border border-orange-100">
              <StarIcon sx={{ color: '#ea580c', fontSize: '12px' }} />
              <span className="text-[10px] font-bold text-orange-700">NEW</span>
            </div>
          )}

          <div className="mt-auto flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-gray-900 leading-none">
                  ₹{item.variants?.[0]?.offers?.[0]?.sellingPrice ?? item.variants?.[0]?.sellingPrice ?? item.minPrice ?? item.sellingPrice ?? 'N/A'}
                </span>
                {(item.variants?.[0]?.offers?.[0]?.mrpPrice || item.variants?.[0]?.mrpPrice || item.mrpPrice) && (
                  <span className="text-[12px] sm:text-xs text-gray-400 line-through font-medium leading-none mb-[2px]">
                    ₹{item.variants?.[0]?.offers?.[0]?.mrpPrice || item.variants?.[0]?.mrpPrice || item.mrpPrice}
                  </span>
                )}
              </div>
              {(() => {
                const sellingPrice = item.variants?.[0]?.offers?.[0]?.sellingPrice || item.variants?.[0]?.sellingPrice || item.minPrice || item.sellingPrice;
                const mrpPrice = item.variants?.[0]?.offers?.[0]?.mrpPrice || item.variants?.[0]?.mrpPrice || item.mrpPrice;

                if (sellingPrice && mrpPrice && mrpPrice > sellingPrice) {
                  const discount = Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100);
                  return (
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-1 rounded">
                        {discount}% off
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div 
              className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-orange-50 transition-colors z-20 group/heart" 
              title="Wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isInWishlist ? handleRemoveWishlist(e as any) : handleAddWishlist(e as any);
              }}
            >
              <div className="heart-container scale-75 sm:scale-100">
                <input 
                  type="checkbox" 
                  className="checkbox" 
                  checked={isInWishlist} 
                  readOnly
                  style={{ pointerEvents: 'none' }}
                />
                <div className="svg-container">
                    <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                        </path>
                    </svg>
                    <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                        </path>
                    </svg>
                    <svg className="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="10,10 20,20"></polygon>
                        <polygon points="10,50 20,50"></polygon>
                        <polygon points="20,80 30,70"></polygon>
                        <polygon points="90,10 80,20"></polygon>
                        <polygon points="90,50 80,50"></polygon>
                        <polygon points="80,80 70,70"></polygon>
                    </svg>
                </div>
              </div>
            </div>
          </div>

          {/* District fallback for distance badge if needed */}
          {!shouldShowDistance && locationFilter?.type === 'district' && item.seller?.district && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-3 pt-2 border-t border-gray-50">
              <LocationOnIcon sx={{ fontSize: 12 }} />
              <span className="truncate">{item.seller.district}</span>
            </div>
          )}
        </div>
      </div>

      {showChatBot && (
        <section className="absolute left-16 top-0 z-[1000]">
          <Modal
            open={true}
            onClose={handleCloseChatBot}
          >
            <Box sx={style}>
              <ChatBot handleClose={handleCloseChatBot} productId={item._id} />
            </Box>
          </Modal>
        </section>
      )}

      {/* Snackbar for Wishlist Alerts */}
      <Portal>
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={3000} 
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};

export default ProductCard;