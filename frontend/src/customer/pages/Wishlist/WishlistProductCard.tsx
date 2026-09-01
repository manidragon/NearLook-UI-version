import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from "../../../types/productTypes";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { addProductToWishlist, removeProductFromWishlist } from "../../../redux/Customer/WishlistSlice";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import "../Products/ProductCard/ProductCard.css";
import { isWishlisted } from '../../../util/isWishlisted';
import StarIcon from '@mui/icons-material/Star';

interface ProductCardProps {
  item: Product;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";
const ERROR_IMAGE = "https://via.placeholder.com/300x300?text=Image+Error";

const WishlistProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const wishlist = useAppSelector((state) => state.wishlist);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error' | 'info'>('success');

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

  // Check if product is in wishlist
  const isInWishlist = useMemo(() => {
    if (!item._id || !wishlist.wishlist) {
      return false;
    }
    return isWishlisted(wishlist.wishlist, item);
  }, [item._id, item, wishlist.wishlist]);

  const handleAddWishlist = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!localStorage.getItem("jwt")) {
      setSnackbarMessage("Please login to add to wishlist");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (!item._id) return;

    dispatch(addProductToWishlist({ productId: item._id }));
    setSnackbarMessage("Added to wishlist");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleRemoveWishlist = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!item._id) return;

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = ERROR_IMAGE;
  };

  const sellingPrice = item.variants?.[0]?.offers?.[0]?.sellingPrice || item.variants?.[0]?.sellingPrice || item.minPrice || item.sellingPrice;
  const mrpPrice = item.variants?.[0]?.offers?.[0]?.mrpPrice || item.variants?.[0]?.mrpPrice || item.mrpPrice;

  return (
    <>
      <div
        onClick={() => {
          const categoryId = typeof item.category === 'object' && item.category !== null ? item.category.categoryId : item.category;
          navigate(`/product-details/${categoryId || 'all'}/${item.title}/${item._id}`);
        }}
        className="product-card cursor-pointer relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="image-wrapper">
          {productImages.length > 0 ? (
            productImages.map((image: string, index: number) => (
              <img
                key={`${image}-${index}`}
                className="product-img absolute"
                src={image}
                alt={`${item.title} - ${index + 1}`}
                style={{ opacity: index === currentImage ? 1 : 0 }}
                onError={handleImageError}
                loading="lazy"
              />
            ))
          ) : (
            <img
              key="placeholder"
              className="product-img absolute opacity-50"
              src={PLACEHOLDER_IMAGE}
              alt="No image available"
            />
          )}
        </div>

        <div className="pc-content">
          <h2 className="pc-title" title={item.title}>
            {item.title}
          </h2>
          
          {/* Average Rating */}
          {(item.totalReviews || item.numRatings) ? (
            <div className="flex items-center gap-1 mt-1 mb-2">
              <StarIcon sx={{ color: '#FAAF00', fontSize: '14px' }} />
              <span className="text-xs font-bold text-gray-700">{item.averageRating ? item.averageRating.toFixed(1) : "0.0"}</span>
              <span className="text-xs text-gray-500">({item.totalReviews || item.numRatings || 0})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1 mb-2">
              <StarIcon sx={{ color: '#FAAF00', fontSize: '14px' }} />
              <span className="text-xs font-bold text-gray-700">New</span>
            </div>
          )}

          <div className="pc-footer">
            <div className="pc-price-container flex flex-col gap-1">
              <div className="flex items-end gap-1.5">
                <span className="pc-price font-extrabold text-gray-900">
                  ₹{sellingPrice || 'N/A'}
                </span>
                {mrpPrice !== undefined && sellingPrice !== undefined && mrpPrice > sellingPrice && (
                  <span className="text-[12px] sm:text-xs text-gray-600 line-through font-medium leading-none mb-[2px]">
                    ₹{mrpPrice}
                  </span>
                )}
              </div>
              {mrpPrice !== undefined && sellingPrice !== undefined && mrpPrice > sellingPrice && (
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-green-800 bg-green-50 px-1 rounded">
                    {Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)}% off
                  </span>
                </div>
              )}
            </div>

            <div 
              className="heart-container" 
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isInWishlist) {
                  handleRemoveWishlist(e as any);
                } else {
                  handleAddWishlist(e as any);
                }
              }}
              style={{ zIndex: 10 }}
            >
              <input 
                type="checkbox" 
                className="checkbox" 
                checked={isInWishlist} 
                readOnly
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
      </div>

      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WishlistProductCard;