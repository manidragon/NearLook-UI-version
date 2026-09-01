// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Cart\PricingCard.tsx
import { Divider } from "@mui/material";
import {
  sumCartItemMrpPrice,
  sumCartItemSellingPrice,
} from "../../../util/cartCalculator";
import { useAppSelector } from "../../../redux/Store";
import { selectLocationFilter } from "../../../redux/Customer/ProductSlice";

const PricingCard = () => {
  const cart = useAppSelector((state) => state.cart);
  const locationFilter = useAppSelector(selectLocationFilter);
  
  const PLATFORM_FEE = 7;
  
  // Calculate Delivery Charges dynamically
  let totalDeliveryCharges = 0;
  let maxFreeRadius = 0;
  const cartItems = cart.cart?.cartItems || [];
  
  // Group cart items by seller
  const cartItemsBySeller = cartItems.reduce((acc, item) => {
    // Find the offer that this cart item uses
    let matchingOffer = null;
    if (item.product?.variants) {
      for (const variant of item.product.variants) {
        const offer = variant.offers?.find(o => o._id === item.offerId);
        if (offer) {
          matchingOffer = offer;
          break;
        }
      }
    }
    
    // Determine the seller ID and name safely
    const sellerObj = typeof matchingOffer?.seller === 'object' ? matchingOffer.seller : null;
    const sellerId = sellerObj?._id ?? (typeof matchingOffer?.seller === 'string' ? matchingOffer.seller : item.sellerId) ?? 'unknown';
    const sellerName = sellerObj?.businessDetails?.businessName ?? item.sellerName ?? 'Unknown Seller';
    
    // Extract minFreeDelivery safely
    let minFreeDelivery = 500; // Default
    if ((sellerObj as any)?.minFreeDelivery !== undefined) {
      minFreeDelivery = (sellerObj as any).minFreeDelivery;
    } else if (item.sellerId && (item.sellerId as any).minFreeDelivery !== undefined) {
      minFreeDelivery = (item.sellerId as any).minFreeDelivery;
    }
    
    if (!acc[sellerId]) {
      acc[sellerId] = {
        sellerName,
        items: [],
        deliveryCharge: 0,
        groupTotalSellingPrice: 0,
        minFreeDelivery
      };
    }
    acc[sellerId].items.push(item);
    
    // Track total selling price for this seller's group
    acc[sellerId].groupTotalSellingPrice += (item.sellingPrice || 0);

    // Extract distance dynamically from item, product, or offer. Fallback to 14.3 km if missing
    const distanceToSellerKM = (item as any).distance ?? (matchingOffer as any)?.distance ?? (item.product as any)?.distance ?? 14.3;

    // Check if delivery charge applies
    if (matchingOffer && matchingOffer.hasDeliveryCharge) {
      const freeRadius = matchingOffer.freeDeliveryRadiusKM || 0;
      if (freeRadius > maxFreeRadius) maxFreeRadius = freeRadius;

      // Apply charge if location is not used, or if distance exceeds the free radius.
      if (!locationFilter || distanceToSellerKM > freeRadius) {
        const charge = matchingOffer.deliveryChargePrice || 0;
        acc[sellerId].deliveryCharge += charge;
      }
    }
    
    return acc;
  }, {} as Record<string, { sellerName: string; items: any[]; deliveryCharge: number; groupTotalSellingPrice: number; minFreeDelivery: number }>);

  // Second pass: Apply minFreeDelivery logic
  Object.values(cartItemsBySeller).forEach(group => {
    // If the group's total purchase exceeds the seller's minFreeDelivery threshold, waive the delivery charge
    if (group.groupTotalSellingPrice >= group.minFreeDelivery) {
      group.deliveryCharge = 0;
    }
    totalDeliveryCharges += group.deliveryCharge;
  });

  // ✅ Calculate total: selling price + platform fee + delivery charge
  const totalAmount = (cart.cart?.totalSellingPrice || 0) + PLATFORM_FEE + totalDeliveryCharges;

  // ✅ Calculate discount for display
  const discount = sumCartItemMrpPrice(cart.cart?.cartItems || []) -
                   sumCartItemSellingPrice(cart.cart?.cartItems || []);

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-[16px] font-medium text-[#878787] uppercase tracking-wide">
          Price Details
        </h2>
      </div>

      <div className="space-y-4 px-6 py-5 text-[16px]">
        {/* Subtotal (MRP) */}
        <div className="flex justify-between items-center text-[#212121]">
          <span>Price ({cart.cart?.cartItems?.length || 0} item{cart.cart?.cartItems?.length !== 1 ? 's' : ''})</span>
          <span>₹{cart.cart?.totalMrpPrice || 0}</span>
        </div>
        
        {/* Discount */}
        <div className="flex justify-between items-center text-[#212121]">
          <span>Discount</span>
          <span className="text-[#15803d]">- ₹{discount || 0}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between items-center text-[#212121]">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Delivery Charges</span>
            {maxFreeRadius > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                (Free within {maxFreeRadius} km)
              </span>
            )}
          </div>
          <span className={totalDeliveryCharges === 0 ? "text-[#15803d]" : ""}>
            {totalDeliveryCharges === 0 ? "Free" : `₹${totalDeliveryCharges}`}
          </span>
        </div>
        
        {/* Platform fee */}
        <div className="flex justify-between items-center text-[#212121]">
          <span>Platform fee</span>
          <span>₹{PLATFORM_FEE}</span>
        </div>
      </div>
      
      <div className="px-6">
        <Divider sx={{ borderStyle: 'dashed' }} />
      </div>

      {/* Total */}
      <div className="font-bold text-[18px] text-[#212121] px-6 py-4 flex justify-between items-center">
        <span>Total Amount</span>
        <span>₹{totalAmount}</span>
      </div>

      <div className="px-6">
        <Divider sx={{ borderStyle: 'dashed' }} />
      </div>

      {/* Savings Footer */}
      <div className="px-6 py-4 text-[#15803d] font-medium text-[16px]">
        You will save ₹{discount} on this order
      </div>
    </div>
  );
};

export default PricingCard;