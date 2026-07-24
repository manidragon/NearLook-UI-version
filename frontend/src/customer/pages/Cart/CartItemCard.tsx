// src/customer/pages/Cart/CartItemCard.tsx
import Button from "../../../components/NeonButton";
import { Divider, IconButton } from "@mui/material";
import React from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { CartItem } from '../../../types/cartTypes';
import { useAppDispatch } from '../../../redux/Store';
import { deleteCartItem, updateCartItem } from '../../../redux/Customer/CartSlice';
interface CartItemProps {
  item: CartItem;
}
// ✅ Helper: Safely get first image from product/variant
const getProductImage = (item: CartItem): string => {
  // Strategy 1: Check variant-level images (most specific)
  if (item.product?.variants && item.variantId) {
    const variant = item.product.variants.find((v: any) =>
      v._id?.toString() === item.variantId?.toString()
    );
    if (variant?.images?.[0]) {
      return variant.images[0];
    }
  }
  // Strategy 2: Check product-level images
  if (item.product?.images?.[0]) {
    return item.product.images[0];
  }
  // Strategy 3: Check first variant's images as fallback
  if (item.product?.variants?.[0]?.images?.[0]) {
    return item.product.variants[0].images[0];
  }
  // Strategy 4: Return placeholder
  return 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="90" height="90"%3E%3Crect width="90" height="90" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
};
// ✅ Helper: Get seller name with proper fallback chain
const getSellerName = (item: CartItem): string => {
  // ✅ Priority 1: Use direct sellerName if backend sends it
  if (item.sellerName && item.sellerName.trim() !== '') {
    return item.sellerName;
  }
  
  // ✅ Priority 2: Use populated sellerId object (MOST RELIABLE)
  if (item.sellerId && typeof item.sellerId === 'object') {
    const seller = item.sellerId as any;
    const businessName = seller.businessDetails?.businessName;
    const sellerName = seller.sellerName;
    
    return businessName || sellerName || 'Seller';
  }
  
  // Priority 3: Match sellerId string with variant offers (fallback)
  if (typeof item.sellerId === 'string' && item.product?.variants && item.variantId) {
    const variant = item.product.variants.find(v => 
      String(v._id) === String(item.variantId)
    );
    
    if (variant?.offers) {
      const matchingOffer = variant.offers.find(offer => {
        const offerSellerId = typeof offer.seller === 'string' 
          ? offer.seller 
          : (offer.seller as any)?._id;
        return String(offerSellerId) === String(item.sellerId);
      });
      
      if (matchingOffer && typeof matchingOffer.seller === 'object') {
        const seller = matchingOffer.seller as any;
        const name = seller.businessDetails?.businessName || seller.sellerName;
        return name || 'Seller';
      }
    }
  }
  
  // Fallback to product.seller (least reliable - shows product owner, not seller)
  if (item.product?.seller && typeof item.product.seller === 'object') {
    const seller = item.product.seller as any;
    const name = seller.businessDetails?.businessName || seller.sellerName;
    return name || 'Seller';
  }
  
  return 'Seller';
};
const getVariantSpecs = (item: CartItem): { label: string; value: string }[] => {
  const specs: { label: string; value: string }[] = [];
  // Strategy 1: From variant specifications (Dynamic based on Category Attributes)
  if (item.product?.variants && item.variantId) {
    const variant = item.product.variants.find((v: any) =>
      String(v._id) === String(item.variantId)
    );
    if (variant?.specifications) {
      // ✅ Iterate through ALL keys in specifications object
      Object.entries(variant.specifications).forEach(([key, value]) => {
        // Skip empty/null values
        if (value === null || value === undefined || value === '') return;
        // ✅ Convert value to string safely (handles string/number/boolean)
        const stringValue = String(value).trim();
        if (!stringValue) return;
        // ✅ Format Label: Capitalize and replace underscores/camelCase
        // Example: "processor_brand" -> "Processor Brand", "ram" -> "Ram"
        const formattedLabel = key
          .replace(/_/g, ' ')       // Replace underscores with spaces
          .replace(/([A-Z])/g, ' $1') // Split camelCase
          .trim()
          .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
        specs.push({
          label: formattedLabel,
          value: stringValue
        });
      });
      // If we found dynamic specs, return them
      if (specs.length > 0) {
        return specs;
      }
    }
    // Fallback: Show Color if no other specs found
    if (variant?.color) {
      return [{ label: 'Color', value: variant.color }];
    }
  }
  // Strategy 2: From item.size (e.g., "4 GB+128 GB")
  if (item.size && item.size !== 'Default') {
    if (item.size.includes('+')) {
      return item.size.split('+').map(part => {
        const trimmed = part.trim();
        return { label: 'Spec', value: trimmed };
      });
    }
    return [{ label: 'Variant', value: item.size }];
  }
  return [];
};
const CartItemCard: React.FC<CartItemProps> = ({ item }) => {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity || 1);
  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Only sync from props if we are NOT currently in the middle of a debounced update.
    // This prevents the UI from bouncing back to old values while the backend is still processing.
    if (!updateTimeoutRef.current) {
      setLocalQuantity(item.quantity || 1);
    }
  }, [item.quantity]);

  const dispatch = useAppDispatch();
  // ✅ Safe price calculations with fallbacks
  const lineTotal = item.sellingPrice || 0;
  const quantity = item.quantity || 1;
  const unitPrice = quantity > 0 ? lineTotal / quantity : lineTotal;
  const localLineTotal = unitPrice * localQuantity;

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!newQuantity || newQuantity < 1) return;
    const qty = Number(newQuantity);
    if (isNaN(qty)) return;
    
    // Optimistic UI update immediately
    setLocalQuantity(qty);

    // Clear previous timeout if user clicks rapidly
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the backend call by 500ms
    updateTimeoutRef.current = setTimeout(() => {
      dispatch(updateCartItem({
        jwt: localStorage.getItem("jwt") || "",
        cartItemId: item._id,
        cartItem: { quantity: qty }
      })).finally(() => {
        // Clear the ref once the API call is fully dispatched (or finishes)
        // We clear it here so that the next prop update can sync again if needed
        updateTimeoutRef.current = null;
      });
    }, 500);
  };
  const handleRemoveCartItem = () => {
    dispatch(deleteCartItem({
      jwt: localStorage.getItem("jwt") || "",
      cartItemId: item._id
    }));
  };
  // ✅ Get data safely
  const imageUrl = getProductImage(item);
  const sellerName = getSellerName(item);
  const productTitle = item.product?.title || 'Product title';
  const variantSpecs = getVariantSpecs(item);
  // ✅ Get stock from variant's offer
  const getStock = (): number | null => {
    if (item.product?.variants && item.variantId && item.sellerId) {
      const variant = item.product.variants.find((v: any) =>
        v._id?.toString() === item.variantId?.toString()
      );
      if (variant?.offers) {
        const offer = variant.offers.find((o: any) => {
          const offerSellerId = typeof o.seller === 'string'
            ? o.seller
            : o.seller?._id?.toString();
          return offerSellerId === item.sellerId;
        });
        if (offer?.stock !== undefined) {
          return offer.stock;
        }
      }
    }
    return null;
  };
  const stock = getStock();
  return (
    <div className="item">
      {/* Product Image */}
      <div className="item__img">
        <img
          src={imageUrl}
          alt={productTitle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      {/* Product Details */}
      <div>
        <div className="item__title">
          <div>
            <p className="item__name line-clamp-1" title={productTitle}>{productTitle}</p>
            <p className="item__meta">
              {variantSpecs.map(s => s.value).join(', ')} {variantSpecs.length > 0 && ' | '} Seller: {sellerName}
            </p>
          </div>
          <span className="badge" title="Unit price">
            <LocalOfferIcon sx={{ fontSize: 14 }} />
            <span>₹{unitPrice.toFixed(0)}</span>
          </span>
        </div>
      </div>
      {/* Controls */}
      <div className="item__controls">
        <div className="price" title="Line total">
          ₹{localLineTotal.toFixed(0)}
        </div>
        <div className="qty" aria-label={`Quantity controls for ${productTitle}`}>
          <button
            type="button"
            className="qtyDec"
            aria-label="Decrease quantity"
            disabled={localQuantity <= 1}
            onClick={() => handleUpdateQuantity(localQuantity - 1)}
            style={{ opacity: localQuantity <= 1 ? 0.5 : 1, cursor: localQuantity <= 1 ? 'not-allowed' : 'pointer' }}
          >
            <RemoveIcon sx={{ fontSize: 16 }} />
          </button>
          
          <div className="qtyVal" aria-live="polite">
            {localQuantity}
          </div>
          
          <button
            type="button"
            className="qtyInc"
            aria-label="Increase quantity"
            onClick={() => handleUpdateQuantity(localQuantity + 1)}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
        <button 
          className="btn btn--danger" 
          onClick={handleRemoveCartItem}
          style={{ padding: '6px 10px', fontSize: '0.8rem', marginTop: '4px' }}
          title="Remove Item"
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};
export default CartItemCard;