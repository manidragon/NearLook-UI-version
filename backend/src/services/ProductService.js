// D:\Mani\Code with Zosh\Backup\source code\backend\src\services\ProductService.js

const Product = require("../models/Product");
const Category = require("../models/Category");
const CategoryAttribute = require("../models/CategoryAttribute");
const ProductError = require("../exceptions/ProductError");
const mongoose = require("mongoose");
const { sendVerificationEmail } = require("../utils/sendEmail");

class ProductService {

  async findProductById(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw new Error(`Error finding product: ${error.message}`);
    }
  }

  // ✅ CREATE product with variants (unchanged - already correct)
  async createProduct(req, seller) {

    try {
      const category = await Category.findById(req.category);
      if (!category || category.level !== 3) {
        throw new ProductError(
          "Valid Level 3 category is required"
        );
      }

      const CategoryAttribute = mongoose.model('CategoryAttribute');
      const categoryAttrs = await CategoryAttribute.find({
        categoryId: category.categoryId,
        isActive: true
      });

      const highlightFieldNames = categoryAttrs
        .filter(
          attr =>
            attr.displayInHighlights &&
            !attr.isVariantField
        )
        .map(attr => attr.name.toLowerCase());

      const processedVariants = await Promise.all(
        req.variants.map(async (variant, index) => {
          if (!variant.sku) {
            const slug = req.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
            variant.sku = `${slug}-${variant.color.toLowerCase()}-${index + 1}`.substring(0, 100);
          }

          if (!variant.images || variant.images.length === 0) {
            throw new ProductError(`Variant ${index + 1}: At least one image required`);
          }

          let finalOffers = variant.offers;

          if (!finalOffers || !Array.isArray(finalOffers) || finalOffers.length === 0) {
            if (variant.mrpPrice === undefined || variant.sellingPrice === undefined) {
              throw new ProductError(`Variant ${index + 1}: Either 'offers' array or 'mrpPrice/sellingPrice' fields are required`);
            }
            finalOffers = [{
              seller: seller._id,
              mrpPrice: Number(variant.mrpPrice),
              sellingPrice: Number(variant.sellingPrice),
              stock: Number(variant.stock) || 0,
              sku: variant.sku,
              isActive: variant.isActive !== false
            }];
          }

          for (const [offerIdx, offer] of finalOffers.entries()) {
            if (!offer.seller) {
              throw new ProductError(`Variant ${index + 1}, Offer ${offerIdx + 1}: seller is required`);
            }

            const mrpPrice = Number(offer.mrpPrice);
            const sellingPrice = Number(offer.sellingPrice);
            const stock = Number(offer.stock) || 0;

              if (
                !mrpPrice ||
                mrpPrice <= 0
              ) {
                throw new ProductError(
                  `Variant ${index + 1}: Invalid MRP`
                );
              }

              if (
                !sellingPrice ||
                sellingPrice <= 0
              ) {
                throw new ProductError(
                  `Variant ${index + 1}: Invalid Selling Price`
                );
              }

              if (
                sellingPrice > mrpPrice
              ) {
                throw new ProductError(
                  `Variant ${index + 1}: Selling price cannot exceed MRP`
                );
              }

              if (stock < 0) {
                throw new ProductError(
                  `Variant ${index + 1}: Invalid stock`
                );
              }

            finalOffers[offerIdx] = {
              ...offer,
              seller: offer.seller,
              mrpPrice,
              sellingPrice,
              stock,
              isActive: offer.isActive !== false
            };
          }

          let variantSpecs = {};
          if (variant.specifications && typeof variant.specifications === 'object') {
            Object.entries(variant.specifications).forEach(([key, value]) => {
              variantSpecs[key] = String(value);
            });
          }

          const variantHighlights = {};
          if (req.highlights && typeof req.highlights === 'object') {
            Object.entries(req.highlights).forEach(([key, value]) => {
              const keyLower = key.toLowerCase();
              if (highlightFieldNames.includes(keyLower)) {
                variantHighlights[key] = value;
              }
            });
          }

          return {
            ...variant,
            specifications: variantSpecs,
            highlights: Object.keys(variantHighlights).length > 0 ? variantHighlights : undefined,
            isActive: variant.isActive !== false,
            offers: finalOffers,
            variantOwner: seller._id,
            mrpPrice: undefined,
            sellingPrice: undefined,
            stock: undefined
          };
        })
      );

      const productHighlights = {};
      for (const variant of processedVariants) {
        if (variant.highlights) {
          Object.assign(productHighlights, variant.highlights);
        }
      }

      const product = new Product({

        title:
          req.title.trim(),

        description:
          req.description.trim(),

        category:
          category._id,

        seller:
          seller._id,

        productOwner:
          seller._id,

        highlights:
          Object.keys(
            productHighlights
          ).length > 0
            ? new Map(
                Object.entries(
                  productHighlights
                )
              )
            : new Map(),

        variants:
          processedVariants,

        isActive:
          req.isActive !== false
      });

      await product.save();

      return await Product.findById(product._id).populate('seller', 'sellerName businessDetails.businessName');

    } catch (error) {
      console.error("❌ Create product error:", error.message);
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new ProductError("Duplicate SKU or product slug. Please use unique values.");
      }
      throw new ProductError(error.message || "Failed to create product");
    }
  }

  async getProductsByQuery(query, page = 0, limit = 20) {
    try {
      const Product = require('../models/Product');

      const products = await Product.find(query)
        .populate('category', 'name categoryId level')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page * limit);

      return products;
    } catch (error) {
      console.error('❌ Get products by query error:', error.message);
      throw new ProductError(error.message || 'Failed to fetch products');
    }
  }

  // ✅ NEW: GET NEARBY PRODUCTS
  async getNearbyProducts(lat, lng, radiusKm, page = 0, limit = 20) {
    try {
      const Seller = require("../models/Seller");
      
      // 1. Find sellers within radius
      const nearbySellers = await Seller.find({
        accountStatus: "ACTIVE",
        "location.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat] // MongoDB expects [lng, lat]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      }).select('_id location');

      if (!nearbySellers.length) {
        return [];
      }

      const sellerIds = nearbySellers.map(s => s._id);

      // 2. Fetch products for these sellers
      // Note: We'll filter products where the seller is in sellerIds OR
      // variants.offers.seller is in sellerIds.
      
      const aggregationPipeline = [
        {
          $match: {
            isActive: true,
            approvalStatus: { $in: ['APPROVED', 'Approved', 'approved', null] },
            $or: [
              { seller: { $in: sellerIds } },
              { "variants.offers.seller": { $in: sellerIds } }
            ]
          }
        },
        // Sort by newest for now
        { $sort: { createdAt: -1 } },
        { $skip: page * limit },
        { $limit: limit },
        // Populate category
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        // Populate product seller
        {
          $lookup: {
            from: 'sellers',
            localField: 'seller',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } }
      ];

      const products = await Product.aggregate(aggregationPipeline);

      // Return processed products (map to regular objects and calculate exact distance if needed)
      return products.map(p => {
        // Calculate rough distance based on the product seller's coordinates
        let distance = null;
        const sellerLoc = nearbySellers.find(s => s._id.toString() === p.seller?._id?.toString());
        if (sellerLoc && sellerLoc.location?.coordinates) {
           const sLng = sellerLoc.location.coordinates[0];
           const sLat = sellerLoc.location.coordinates[1];
           // Simple distance formula approximation for sorting/display
           distance = require("../utils/distanceCalculator").calculateDistance(lat, lng, sLat, sLng);
        }
        return {
          ...p,
          distance: distance ? Math.round(distance * 10) / 10 : null
        };
      });

    } catch (error) {
      console.error('❌ Get nearby products error:', error.message);
      throw new ProductError(error.message || 'Failed to fetch nearby products');
    }
  }

  // ✅ ADMIN: Get all products
  async getAllProducts() {
    try {
      const products = await Product.find()
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('category', 'name categoryId level')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName')
        .sort({ createdAt: -1 });
      return products;
    } catch (error) {
      throw new ProductError(error.message || 'Failed to fetch all products');
    }
  }

  // ✅ ADMIN: Update product status
  async updateProductStatus(productId, approvalStatus, rejectReason = '') {
    try {
      const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
      if (!validStatuses.includes(approvalStatus)) {
        throw new ProductError("Invalid status");
      }
      
      const product = await Product.findByIdAndUpdate(
        productId,
        { approvalStatus, rejectReason },
        { new: true, runValidators: true }
      ).populate('seller', 'sellerName businessDetails.businessName email');
      
      if (!product) {
        throw new ProductError("Product not found");
      }

      // ✅ Send notification to seller
      if (product.seller && product.seller.email) {
        const subject = `Your Product is ${approvalStatus}`;
        const message = approvalStatus === 'REJECTED' 
          ? `Your product "${product.title}" has been REJECTED. Reason: ${rejectReason}`
          : `Your product "${product.title}" has been ${approvalStatus}.`;
        sendVerificationEmail(product.seller.email, subject, message).catch(err => console.error("Email error:", err));
      }

      return product;
    } catch (error) {
      throw new ProductError(error.message || 'Failed to update product status');
    }
  }

  // ✅ ADMIN: Get pending products
  async getPendingProducts() {
    try {
      return await Product.find({ approvalStatus: 'PENDING' })
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('category', 'name categoryId level')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new ProductError(error.message || 'Failed to fetch pending products');
    }
  }

  // ✅ ADMIN: Get pending offers
  async getPendingOffers() {
    try {
      const products = await Product.find({ 'variants.offers.approvalStatus': 'PENDING' })
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('category', 'name categoryId level')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName email');
      
      // Extract pending offers
      const pendingOffers = [];
      products.forEach(product => {
        product.variants.forEach(variant => {
          variant.offers.forEach(offer => {
            if (offer.approvalStatus === 'PENDING') {
              pendingOffers.push({
                product: { _id: product._id, title: product.title, category: product.category, images: variant.images },
                variantId: variant._id,
                color: variant.color,
                specifications: variant.specifications,
                offer: offer
              });
            }
          });
        });
      });
      return pendingOffers;
    } catch (error) {
      throw new ProductError(error.message || 'Failed to fetch pending offers');
    }
  }

  // ✅ ADMIN: Get all offers
  async getAllOffers() {
    try {
      // Find all products that have at least one offer (using $exists)
      const products = await Product.find({ 'variants.offers.0': { $exists: true } })
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('category', 'name categoryId level')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName email');
      
      // Extract all offers
      const allOffers = [];
      products.forEach(product => {
        product.variants.forEach(variant => {
          variant.offers.forEach(offer => {
            allOffers.push({
              product: { _id: product._id, title: product.title, category: product.category, images: variant.images },
              variantId: variant._id,
              color: variant.color,
              specifications: variant.specifications,
              offer: offer
            });
          });
        });
      });
      return allOffers;
    } catch (error) {
      throw new ProductError(error.message || 'Failed to fetch offers');
    }
  }

  // ✅ ADMIN: Update offer status
  async updateOfferStatus(productId, variantId, offerId, approvalStatus, rejectReason = '') {
    try {
      const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
      if (!validStatuses.includes(approvalStatus)) {
        throw new ProductError("Invalid status");
      }
      
      const product = await Product.findById(productId);
      if (!product) throw new ProductError("Product not found");
      
      const variant = product.variants.id(variantId);
      if (!variant) throw new ProductError("Variant not found");
      
      const offer = variant.offers.id(offerId);
      if (!offer) throw new ProductError("Offer not found");
      
      offer.approvalStatus = approvalStatus;
      offer.rejectReason = rejectReason;
      
      product.markModified('variants');
      await product.save(); // Triggers hooks to recalculate prices
      
      // We need to populate the seller to send email
      const populatedProduct = await Product.findById(productId)
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName email');
      
      const updatedOffer = populatedProduct.variants.id(variantId).offers.id(offerId);
      
      // ✅ Send notification to seller
      if (updatedOffer.seller && updatedOffer.seller.email) {
        const subject = `Your Offer is ${approvalStatus}`;
        const message = approvalStatus === 'REJECTED' 
          ? `Your offer for "${populatedProduct.title}" has been REJECTED. Reason: ${rejectReason}`
          : `Your offer for "${populatedProduct.title}" has been ${approvalStatus}.`;
        sendVerificationEmail(updatedOffer.seller.email, subject, message).catch(err => console.error("Email error:", err));
      }

      return { product: populatedProduct, offer: updatedOffer };
    } catch (error) {
      throw new ProductError(error.message || 'Failed to update offer status');
    }
  }

  // ✅ UPDATE PRODUCT (unchanged - already correct)
  async updateProduct(productId, updates, sellerId) {
    try {
      const product = await Product.findById(productId)
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName');

      if (!product) {
        console.error('❌ [DEBUG] Product not found');
        throw new ProductError("Product not found");
      }

      const sellerHasOffer = product.variants.some(v =>
        v.offers?.some(o => {
          const offerSellerId = typeof o.seller === 'string'
            ? o.seller
            : o.seller?._id?.toString() || o.seller?.toString();
          return offerSellerId === sellerId.toString() && o.isActive !== false;
        })
      );

      const isProductOwner = typeof product.seller === 'string'
        ? product.seller === sellerId.toString()
        : product.seller?._id?.toString() === sellerId.toString();

      if (!sellerHasOffer && !isProductOwner) {
        console.error('❌ [DEBUG] Access denied');
        throw new ProductError("Access denied: You don't have offers in this product");
      }

      const updateOps = [];

      if (updates.variants && Array.isArray(updates.variants)) {
        for (const updateVar of updates.variants) {
          const existingVariant = product.variants.find(v => v._id.toString() === updateVar._id);

          if (!existingVariant) {
            continue;
          }

          if (updateVar.offers && Array.isArray(updateVar.offers)) {
            for (const offerUpdate of updateVar.offers) {
              let existingOffer = existingVariant.offers?.find(
                o => o._id?.toString() === offerUpdate._id?.toString()
              );

              if (!existingOffer && !offerUpdate._id) {
                existingOffer = existingVariant.offers?.find(
                  o => o.seller?.toString() === sellerId.toString()
                );
              }

              if (!existingOffer) {
                continue;
              }

              const offerSellerId = typeof existingOffer.seller === 'string'
                ? existingOffer.seller
                : existingOffer.seller?._id?.toString() || existingOffer.seller?.toString();

              if (offerSellerId !== sellerId.toString()) {
                continue;
              }

              const offerUpdates = {};
              if (offerUpdate.mrpPrice !== undefined) offerUpdates['variants.$[v].offers.$[o].mrpPrice'] = offerUpdate.mrpPrice;
              if (offerUpdate.sellingPrice !== undefined) offerUpdates['variants.$[v].offers.$[o].sellingPrice'] = offerUpdate.sellingPrice;
              if (offerUpdate.stock !== undefined) offerUpdates['variants.$[v].offers.$[o].stock'] = offerUpdate.stock;
              if (offerUpdate.sku !== undefined) offerUpdates['variants.$[v].offers.$[o].sku'] = offerUpdate.sku;
              if (offerUpdate.isReturnable !== undefined) offerUpdates['variants.$[v].offers.$[o].isReturnable'] = offerUpdate.isReturnable;
              if (offerUpdate.returnTAT !== undefined) offerUpdates['variants.$[v].offers.$[o].returnTAT'] = offerUpdate.returnTAT;
              if (offerUpdate.isReplaceable !== undefined) offerUpdates['variants.$[v].offers.$[o].isReplaceable'] = offerUpdate.isReplaceable;
              if (offerUpdate.replacementTAT !== undefined) offerUpdates['variants.$[v].offers.$[o].replacementTAT'] = offerUpdate.replacementTAT;
              if (offerUpdate.hasDeliveryCharge !== undefined) offerUpdates['variants.$[v].offers.$[o].hasDeliveryCharge'] = offerUpdate.hasDeliveryCharge;
              if (offerUpdate.deliveryChargePrice !== undefined) offerUpdates['variants.$[v].offers.$[o].deliveryChargePrice'] = offerUpdate.deliveryChargePrice;
              if (offerUpdate.freeDeliveryRadiusKM !== undefined) offerUpdates['variants.$[v].offers.$[o].freeDeliveryRadiusKM'] = offerUpdate.freeDeliveryRadiusKM;
              if (offerUpdate.isActive !== undefined) offerUpdates['variants.$[v].offers.$[o].isActive'] = offerUpdate.isActive;
              offerUpdates['variants.$[v].offers.$[o].updatedAt'] = new Date();


              if (Object.keys(offerUpdates).length > 0) {
                const result = await Product.updateOne(
                  {
                    _id: productId,
                    'variants._id': new mongoose.Types.ObjectId(updateVar._id),
                    'variants.offers._id': new mongoose.Types.ObjectId(existingOffer._id)
                  },
                  { $set: offerUpdates },
                  {
                    arrayFilters: [
                      { 'v._id': new mongoose.Types.ObjectId(updateVar._id) },
                      { 'o._id': new mongoose.Types.ObjectId(existingOffer._id) }
                    ],
                    runValidators: true
                  }
                );

                if (result.modifiedCount === 0) {
                  throw new ProductError("Failed to update offer, database returned unmodified.");
                }
              }
            }
          }

          const variantLevelUpdates = {};
          if (updateVar.images && Array.isArray(updateVar.images)) {
            variantLevelUpdates['variants.$[v].images'] = updateVar.images;
          }
          if (updateVar.color !== undefined) {
            variantLevelUpdates['variants.$[v].color'] = updateVar.color;
          }
          if (updateVar.isActive !== undefined) {
            variantLevelUpdates['variants.$[v].isActive'] = updateVar.isActive;
          }

          if (Object.keys(variantLevelUpdates).length > 0) {
            await Product.updateOne(
              {
                _id: productId,
                'variants._id': new mongoose.Types.ObjectId(updateVar._id)
              },
              { $set: variantLevelUpdates },
              {
                arrayFilters: [{ 'v._id': new mongoose.Types.ObjectId(updateVar._id) }],
                runValidators: true
              }
            );
          }
        }
      }

      const topLevelFields = ['title', 'description', 'isActive', 'isFeatured'];
      const topLevelUpdates = {};

      for (const field of topLevelFields) {
        if (updates[field] !== undefined && updates[field] !== null) {
          if (product.catalog) {
            const catalogProduct = await Product.findById(product.catalog).select('seller');
            const isCatalogOwner = catalogProduct?.seller?.toString() === sellerId.toString();
            if (!isCatalogOwner) {
              continue;
            }
          }
          topLevelUpdates[field] = updates[field];
        }
      }

      if (Object.keys(topLevelUpdates).length > 0) {
        await Product.updateOne(
          { _id: productId },
          { $set: { ...topLevelUpdates, updatedAt: new Date() } },
          { runValidators: true }
        );
      }

      await Product.updateCatalogPrices(productId);

      const updatedProduct = await Product.findById(productId)
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName');

      return updatedProduct;

    } catch (error) {
      console.error('❌ [DEBUG] Update product error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new ProductError(error.message || "Failed to update product");
    }
  }

  // ✅ GET product with color/variant filtering + location support
  async getProductById(productId, filters = {}) {
    try {
      const { color, specs, location } = filters;

      // ✅ ADD 'location' and 'district' to populate
      const product = await Product.findById(productId)
        .populate('seller', 'sellerName businessDetails.businessName district location')
        .populate('category', 'name categoryId level')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName district location');

      if (!product || !product.isActive) {
        throw new ProductError("Product not found");
      }

      // ✅ Use product.variants (NOT activeVariants)
      let variants = product.variants || [];

      // Filter by color if provided
      if (color) {
        variants = variants.filter(v =>
          v.color?.toLowerCase() === color.toLowerCase() && v.isActive !== false
        );
      }

      // Filter by specs if provided
      if (specs && typeof specs === 'object') {
        const locationKeys = ['userLat', 'userLng', 'radiusKm', 'district'];
        const validSpecs = Object.fromEntries(
          Object.entries(specs).filter(([key]) => !locationKeys.includes(key))
        );

        if (Object.keys(validSpecs).length > 0) {
          Object.entries(validSpecs).forEach(([key, value]) => {
            variants = variants.filter(v =>
              v.specifications?.[key]?.toLowerCase() === String(value).toLowerCase()
            );
          });
        }
      }

      // ✅ Convert variants to plain objects and filter out unapproved offers unconditionally
      variants = variants.map(variant => {
        const variantObj = variant.toObject
          ? variant.toObject({ getters: true, virtuals: false, flattenMaps: true })
          : { ...variant };

        if (variantObj.offers && Array.isArray(variantObj.offers)) {
          // Keep only approved offers (or null for legacy) and active offers
          let validOffers = variantObj.offers.filter(o => 
            o.isActive !== false && (o.approvalStatus === 'APPROVED' || o.approvalStatus == null)
          );

          if (location?.type === 'current' && location.coordinates) {
            const { lat, lng } = location.coordinates;
            validOffers = validOffers.map(offer => {
              const seller = offer.seller;
              let distance = null;
              if (seller?.location?.coordinates?.[0] && seller?.location?.coordinates?.[1]) {
                const sellerLng = seller.location.coordinates[0];
                const sellerLat = seller.location.coordinates[1];
                distance = _calculateDistance(lat, lng, sellerLat, sellerLng);
              }
              return { ...offer, distance: distance !== null ? Math.round(distance * 10) / 10 : null };
            });

            validOffers.sort((a, b) => {
              if (a.distance === null && b.distance === null) return 0;
              if (a.distance === null) return 1;
              if (b.distance === null) return -1;
              return a.distance - b.distance;
            });
          }
          
          return { ...variantObj, offers: validOffers };
        }
        return variantObj;
      }).filter(v => v.isActive !== false && v.offers && v.offers.length > 0);

      // ✅ Return product with variants
      const productObj = product.toObject();

      return {
        ...productObj,
        variants: variants,  // ✅ Return in 'variants' field
        activeVariants: undefined,
        meta: {
          availableColors: product.uniqueColors || [],
          availableSpecs: Object.fromEntries(product.availableSpecs || {}),
          priceRange: { min: product.minPrice, max: product.maxPrice }
        }
      };

    } catch (error) {

      console.error(
        "❌ Get products by query error:",
        error.message
      );

      throw new ProductError(
        error.message ||
        "Failed to fetch products"
      );
    }
  }

  // ✅✅✅ FULLY FIXED: searchProducts with location + district support
  async searchProducts(filters) {
    try {
      const {
        search, category, colors, specs,
        minPrice, maxPrice, minDiscount,
        sortBy = 'newest', page = 0, limit = 20,
        location, district  // ✅ Extract district parameter
      } = filters;

      const safeLimit = Math.min(parseInt(limit) || 20, 100);
      const aggregationPipeline = [];
      const searchConditions = [];

      // ✅ Build search conditions
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const regexPattern = new RegExp(
          searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i'
        );

        searchConditions.push(
          { title: { $regex: regexPattern } },
          { slug: { $regex: regexPattern } },
          { sellerBusinessName: { $regex: regexPattern } },
          { categoryName: { $regex: regexPattern } },
          { categorySlug: { $regex: regexPattern } },
          { 'variants.color': { $regex: regexPattern } },
          { 'variants.specifications': { $regex: regexPattern } },
          { availableColors: { $regex: regexPattern } }
        );
      }

      // ✅ Base match: isActive = true (NO district filter here yet)
      const baseMatch = { isActive: true, approvalStatus: { $in: ['APPROVED', 'Approved', 'approved', null] } };

      if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
          baseMatch.category = new mongoose.Types.ObjectId(category);
        } else {
          try {
            const Category = mongoose.model('Category');
            const catDoc = await Category.findOne({ categoryId: category, level: 3 });
            if (catDoc) baseMatch.category = catDoc._id;
          } catch (err) {
            console.warn('⚠️ Category slug resolution failed:', err.message);
          }
        }
      }

      aggregationPipeline.push({ $match: baseMatch });

      // ✅ Apply search conditions
      if (searchConditions.length > 0) {
        aggregationPipeline.push({ $match: { $or: searchConditions } });
      }

      // ✅ Price filters
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceMatch = {};
        if (minPrice !== undefined) priceMatch.$gte = minPrice;
        if (maxPrice !== undefined) priceMatch.$lte = maxPrice;
        aggregationPipeline.push({ $match: { minPrice: priceMatch } });
      }

      // ✅ Variant color filter
      if (colors?.length > 0) {
        aggregationPipeline.push({
          $match: {
            'variants.color': { $in: colors.map(c => new RegExp(`^${c}$`, 'i')) },
            'variants.isActive': true
          }
        });
      }

      // ✅ Dynamic spec filters
      if (specs && typeof specs === 'object') {
        Object.entries(specs).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            const regexValues = values.map(
              v => new RegExp(`^${String(v).trim()}$`, 'i')
            );
            aggregationPipeline.push({
              $match: {
                $or: [
                  { [`highlights.${key}`]: { $in: regexValues } },
                  { [`variants.specifications.${key}`]: { $in: regexValues } }
                ]
              }
            });
          }
        });
      }

      // ✅ Filter to only include products with active variants AND active offers
      aggregationPipeline.push({
        $addFields: {
          activeVariants: {
            $filter: {
              input: '$variants',
              as: 'v',
              cond: {
                $and: [
                  '$$v.isActive',
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: { $ifNull: ['$$v.offers', []] },
                            as: 'o',
                            cond: {
                              $and: [
                                { $eq: ['$$o.isActive', true] },
                                { $in: [{ $ifNull: ['$$o.approvalStatus', 'APPROVED'] }, ['APPROVED', 'Approved', 'approved', null]] }
                              ]
                            }
                          }
                        }
                      },
                      0
                    ]
                  }
                ]
              }
            }
          }
        }
      });
      aggregationPipeline.push({
        $match: { activeVariants: { $ne: [], $exists: true } }
      });

      // ✅ Sort options
      const sortOptions = {
        'price_low': { minPrice: 1 },
        'price_high': { minPrice: -1 },
        'newest': { createdAt: -1 },
        'rating': { averageRating: -1, createdAt: -1 },
        'relevance': { createdAt: -1 },
        'distance': { distance: 1 }
      };
      const effectiveSortBy = location?.type === 'current' ? 'distance' : sortBy;
      const selectedSort = sortOptions[effectiveSortBy] || sortOptions.newest;
      aggregationPipeline.push({ $sort: selectedSort });

      // ✅ Pagination
      aggregationPipeline.push({ $skip: page * safeLimit }, { $limit: safeLimit });

      // ✅ Populate seller (include district for post-filtering)
      aggregationPipeline.push({
        $lookup: {
          from: 'sellers',
          localField: 'variants.offers.seller',  // ✅ Match on offers.seller
          foreignField: '_id',
          as: 'offerSellers'
        }
      });

      // ✅ Also populate product-level seller
      aggregationPipeline.push({
        $lookup: {
          from: 'sellers',
          localField: 'seller',
          foreignField: '_id',
          as: 'productSeller',
          pipeline: [{ $project: { sellerName: 1, businessDetails: 1, email: 1, mobile: 1, district: 1, location: 1 } }]
        }
      });
      aggregationPipeline.push({ $unwind: { path: '$productSeller', preserveNullAndEmptyArrays: true } });

      // ✅ Populate category
      aggregationPipeline.push({
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
          pipeline: [{ $project: { name: 1, categoryId: 1, level: 1, image: 1 } }]
        }
      });
      aggregationPipeline.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } });

      let products = await Product.aggregate(aggregationPipeline);

      // ✅✅✅ POST-PROCESS: Filter by district AFTER population
      if (district && typeof district === 'string' && district.trim()) {
        const targetDistrict = district.trim();

        products = products.filter(product => {
          // Check if product has ANY variant with an offer from a seller in this district
          const hasMatchingOffer = product.variants?.some(variant => {
            return variant.offers?.some(offer => {
              // Check populated seller data
              const sellerDistrict = offer.seller?.district ||
                product.offerSellers?.find(s =>
                  s._id?.toString() === offer.seller?.toString() ||
                  s._id?.toString() === offer.seller?._id?.toString()
                )?.district;
              return sellerDistrict === targetDistrict;
            });
          });

          return hasMatchingOffer;
        });

      }

      // ✅ Format distance if location search was used
      if (location?.type === 'current' && Array.isArray(products)) {
        products = products.map(product => {
          const productObj = product.toObject?.() || product;
          if (typeof productObj.distance === 'number') {
            productObj.distance = Math.round(productObj.distance * 10) / 10;
          }
          return productObj;
        });
      }

      // ✅ Convert Mongoose docs to plain objects
      return products.map(p => {
        const obj = p.toObject?.() || p;
        // Clean up helper fields
        delete obj.offerSellers;
        delete obj.productSeller;
        return obj;
      });

    } catch (error) {
      console.error("❌ Search products service error:", {
        message: error.message,
        stack: error.stack,
        filters: filters
      });
      throw new ProductError(error.message || "Search failed");
    }
  }

  // ✅ GET seller's products (unchanged)
  async getSellerProducts(sellerId, page = 0, limit = 20) {
    try {
      const products = await Product.find({ seller: sellerId, isActive: true })
        .populate('seller', 'sellerName businessDetails.businessName')
        .populate('variants.offers.seller', 'sellerName businessDetails.businessName')
        .populate('category', 'name categoryId level')
        .lean();

      const transformedProducts = products.map(product => {
        if (product.variants && Array.isArray(product.variants)) {
          product.variants = product.variants.map(variant => {
            if (variant.specifications instanceof Map) {
              variant.specifications = Object.fromEntries(variant.specifications);
            }
            if (variant.variantOwner && typeof variant.variantOwner !== 'string') {
              variant.variantOwner = variant.variantOwner._id || variant.variantOwner.$oid || String(variant.variantOwner);
            }
            return variant;
          });
        }
        if (product.highlights instanceof Map) {
          product.highlights = Object.fromEntries(product.highlights);
        }
        return product;
      });

      const total = await Product.countDocuments({ seller: sellerId, isActive: true });

      return {
        products: transformedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error("❌ Get seller products error:", error.message);
      throw new ProductError(error.message || "Failed to fetch products");
    }
  }

  // ✅ DELETE product (soft delete) (unchanged)
  async deleteProduct(productId, sellerId) {
    try {
      const product = await Product.findOne({ _id: productId, seller: sellerId });
      if (!product) {
        throw new ProductError("Product not found or access denied");
      }

      product.isActive = false;
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(v => {
          if (v && typeof v === 'object') {
            v.isActive = false;
          }
        });
      }

      await product.save();
      return { message: "Product deactivated successfully" };

    } catch (error) {

      console.error(
        "❌ Get seller catalog offers error:",
        error.message
      );

      throw new ProductError(
        error.message ||
        "Failed to fetch catalog offers"
      );
    }
  }
}

module.exports = new ProductService();

function _calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}