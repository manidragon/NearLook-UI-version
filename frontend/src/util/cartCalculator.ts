// D:\Mani\Code with Zosh\Backup\source code\frontend\src\util\cartCalculator.ts
import { type CartItem } from "../types/cartTypes"

export const sumCartItemSellingPrice = (items: CartItem[]): number => {
    return items.reduce((acc, item) => { return item?.sellingPrice + acc }, 0)
}

export const sumCartItemMrpPrice = (items: CartItem[]): number => {
    return items.reduce((acc, item) => { return item?.mrpPrice + acc }, 0)
}

export const calculateTotalDeliveryCharges = (cartItems: CartItem[], locationFilter: any): number => {
    let totalDeliveryCharges = 0;
    let maxFreeRadius = 0;
    
    // Group cart items by seller
    const cartItemsBySeller = (cartItems || []).reduce((acc, item) => {
      // Find the offer that this cart item uses
      let matchingOffer: any = null;
      if (item.product?.variants) {
        for (const variant of item.product.variants) {
          const offer = variant.offers?.find((o: any) => o._id === item.offerId);
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
      if (sellerObj?.minFreeDelivery !== undefined) {
        minFreeDelivery = sellerObj.minFreeDelivery;
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
    
    return totalDeliveryCharges;
};