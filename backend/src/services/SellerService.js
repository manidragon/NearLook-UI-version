// D:\Mani\Code with Zosh\Backup\source code\backend\src\services\SellerService.js
const Seller = require("../models/Seller"); // Your Seller model
const Address = require("../models/Address"); // Your Address model
const jwtProvider = require("../utils/jwtProvider"); // JWT utility
const bcrypt = require("bcrypt");
const UserRoles = require("../domain/UserRole");
const SellerError = require("../exceptions/SellerError");

class SellerService {
  async getSellerProfile(jwt) {
    const payload = jwtProvider.verifyJwt(jwt);
    const email = payload.email;
    // console.log("email -----  ",email)
    return this.getSellerByEmail(email);
  }

 async createSeller(sellerData) {
  // ✅ DEBUG: Log incoming payload
  console.log('🔍 [DEBUG] createSeller received:', {
    email: sellerData.email,
    hasLocation: !!sellerData.location,
    location: sellerData.location
  });

  const existingSeller = await Seller.findOne({ email: sellerData.email });
  if (existingSeller) {
    throw new SellerError("Seller already exists, use a different email");
  }

  let savedAddress = null;
  if (sellerData.pickupAddress) {
    if (!sellerData.pickupAddress._id) {
      savedAddress = await Address.create(sellerData.pickupAddress);
    } else {
      savedAddress = sellerData.pickupAddress;
    }
  }

  // ✅ STRICT: Only build location if BOTH lat AND lng are valid numbers
  let locationData = null;
  const coords = sellerData.location?.coordinates;
  if (coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng) &&
      coords.lat >= -90 && coords.lat <= 90 &&
      coords.lng >= -180 && coords.lng <= 180) {

    locationData = {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
      address: typeof sellerData.location.address === 'string'
        ? sellerData.location.address.trim()
        : undefined  // ✅ Use undefined, not ''
    };
  }

  const newSeller = new Seller({
    email: sellerData.email,
    pickupAddress: savedAddress,
    sellerName: sellerData.sellerName,
    GSTIN: sellerData.GSTIN,
    role: UserRoles.ROLE_SELLER,
    mobile: sellerData.mobile,
    bankDetails: sellerData.bankDetails,
    businessDetails: sellerData.businessDetails,
    PAN: sellerData.PAN,
    businessType: sellerData.businessType,
    incorporationDate: sellerData.incorporationDate,
    taxDocuments: sellerData.taxDocuments,
    fulfillmentMode: sellerData.fulfillmentMode,
    handlingTime: sellerData.handlingTime,
    storefront: sellerData.storefront,

    performanceMetrics: sellerData.performanceMetrics,
    // ✅ ONLY include location if we have VALID coordinates
    ...(locationData && { location: locationData }),
    // ✅ ONLY include district if provided and non-empty
    ...(sellerData.district && sellerData.district.trim() && {
      district: sellerData.district.trim()
    })
  });

  // ✅ FINAL SAFEGUARD: Remove invalid location objects before save
  if (newSeller.location) {
    const loc = newSeller.location;
    if (loc.type === 'Point' && (!loc.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2)) {
      delete newSeller.location;
    } else if (loc.address && (!loc.coordinates || !Array.isArray(loc.coordinates))) {
      delete newSeller.location.address;
    }
  }

  return await newSeller.save();
}

  async getSellerById(id) {
    const seller = await Seller.findById(id);
    if (!seller) {
      throw new SellerError("Seller not found");
    }
    return seller;
  }

  async getSellerByEmail(email) {
    const seller = await Seller.findOne({ email }).populate("pickupAddress");
    // console.log("seller ",seller)
    if (!seller) {
      throw new SellerError("Seller not found");
    }
    return seller;
  }

  async getAllSellers(status) {
    let query = {};
    if (status && status !== "ALL") {
      query.accountStatus = status;
    }
    return await Seller.find(query);
  }

 async updateSeller(existingSeller, sellerData) {
  const updatePayload = { ...sellerData };

  // ✅ STRICT: Only update location if coordinates are valid numbers
  const coords = sellerData.location?.coordinates;
  if (coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)) {

    updatePayload.location = {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
      address: typeof sellerData.location.address === 'string'
        ? sellerData.location.address.trim()
        : existingSeller.location?.address || ''
    };
  }
  // ✅ If location is explicitly set to null/empty, allow clearing it
  else if (sellerData.location === null || sellerData.location === '') {
    updatePayload.location = null;
  }
  // ✅ If location is sent but invalid, IGNORE it (don't update)

  // Handle district update
  if (sellerData.district && sellerData.district.trim()) {
    updatePayload.district = sellerData.district.trim();
  }

  return await Seller.findByIdAndUpdate(
    existingSeller._id,
    updatePayload,
    {
      new: true,
      runValidators: true
    }
  ).populate("pickupAddress");
}

  async deleteSeller(id) {
    const exists = await Seller.exists({ _id: id });
    if (!exists) {
      throw new SellerError("Seller not found with id " + id);
    }
    await Seller.deleteOne({ _id: id });
  }

  async verifyEmail(email, otp) {
    const seller = await this.getSellerByEmail(email);
    seller.isEmailVerified = true;
    return await seller.save();
  }

  async updateSellerAccountStatus(sellerId, status) {
    const seller = await this.getSellerById(sellerId);
    seller.accountStatus = status;
    await seller.save(); 

    // Sync product offers based on seller status
    const Product = require("../models/Product");
    const AccountStatus = require("../domain/AccountStatus");
    const isSellerActive = status === AccountStatus.ACTIVE;

    // Find all products where this seller has offers or is the owner
    const products = await Product.find({ 
      $or: [
        { "variants.offers.seller": sellerId },
        { seller: sellerId }
      ]
    });
    
    for (const product of products) {
      let modified = false;
      
      // Disable/Enable the seller's offers
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(variant => {
          if (variant.offers && Array.isArray(variant.offers)) {
            variant.offers.forEach(offer => {
              if (offer.seller.toString() === sellerId.toString() && offer.isActive !== isSellerActive) {
                offer.isActive = isSellerActive;
                modified = true;
              }
            });
          }
        });
      }
      
      // We no longer manually disable the entire product here.
      // If this seller was the ONLY one with active offers, disabling their offers 
      // will naturally hide the product in searchWithVariants. If other sellers 
      // have active offers, the product will remain visible for them!

      if (modified) {
        await product.save(); // This triggers the pre-save hook to recalculate prices & aggregated fields
      }
    }

    return seller;
  }
}

module.exports = new SellerService();