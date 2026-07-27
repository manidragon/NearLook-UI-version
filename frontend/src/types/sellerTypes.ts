// src/types/seller.ts

export interface PickupAddress {
    _id?: string;
    name: string;
    mobile: string;
    pinCode: string;
    address: string;
    locality: string;
    city: string;
    state: string;
}

export interface BankDetails {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    upiId?: string;
}

export interface TaxDocument {
    documentName: string;
    documentUrl: string;
}

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    website?: string;
    twitter?: string;
}

export interface Storefront {
    description?: string;
    socialLinks?: SocialLinks;
    themeColor?: string;
    holidayMode?: boolean;
    promotions?: string[];
}

export interface PerformanceMetrics {
    cancellationRate?: number;
    returnRate?: number;
    totalOrdersFulfilled?: number;
    dispatchSlaCompliance?: number;
}

export interface BusinessDetails {
    businessName: string;
    businessEmail?: string;      // ✅ Added
    businessMobile?: string;     // ✅ Added
    businessAddress?: string;    // ✅ Added
    logo?: string;
    banner?: string;
}

export interface Seller {
    _id: string;
    mobile: string;
    GSTIN: string;
    pickupAddress: string | PickupAddress;
    bankDetails: BankDetails;
    sellerName: string;
    email: string;
    businessDetails: BusinessDetails;
    password?: string;
    accountStatus?: string;
    district?: string;
     location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
    role: string;
    isEmailVerified?: boolean;
    
    // New Advanced Fields
    PAN?: string;
    businessType?: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LLC' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
    incorporationDate?: Date | string;
    taxDocuments?: TaxDocument[];
    fulfillmentMode?: 'SELF_SHIP' | 'PLATFORM_FULFILLED' | 'DROPSHIP';
    handlingTime?: number;
    storefront?: Storefront;
    payoutSchedule?: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY';
    performanceMetrics?: PerformanceMetrics;
    averageRating?: number;
    totalReviews?: number;
    minFreeDelivery?: number;
}

// ✅ New type for API responses that include JWT
export interface SellerAuthResponse extends Seller {
  jwt: string;
}

export interface SellerReport {
    _id: string;
    seller: Seller;
    totalEarnings: number;
    totalSales: number;
    totalRefunds: number;
    totalTax: number;
    netEarnings: number;
    totalOrders: number;
    canceledOrders: number;
    totalTransactions: number;
}