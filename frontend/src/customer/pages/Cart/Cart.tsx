// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Cart\Cart.tsx
import {
  Alert,
  Snackbar,
  Button,
  Divider,
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useEffect, useState } from "react";

import CartItemCard from "./CartItemCard";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchUserCart } from "../../../redux/Customer/CartSlice";
import type { CartItem } from "../../../types/cartTypes";
import { applyCoupon } from "../../../redux/Customer/CouponSlice";
import { selectLocationFilter } from "../../../redux/Customer/ProductSlice";

import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const cart = useAppSelector((store) => store.cart);
  const auth = useAppSelector((store) => store.auth);
  const locationFilter = useAppSelector(selectLocationFilter);

  // ✅ FIX 1: Safe selector with fallback for coupon slice
  const couponState = useAppSelector((store) => store.coupon) || {
    couponApplied: false,
    error: null,
    message: null
  };

  const [couponCode, setCouponCode] = useState("");
  const [snackbarOpen, setOpenSnackbar] = useState(false);

  // Fetch cart data
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      // ✅ Force fresh fetch on mount and when auth changes
      dispatch(fetchUserCart(jwt));
    }
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const handleApplyCoupon = (apply: string) => {
    const code =
      apply === "false" ? cart?.cart?.couponCode || "" : couponCode;

    dispatch(
      applyCoupon({
        apply,
        code,
        orderValue: cart?.cart?.totalSellingPrice || 100,
        jwt: localStorage.getItem("jwt") || "",
      })
    );
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // ✅ FIX 2: Safe useEffect with optional chaining
  useEffect(() => {
    // ✅ Use optional chaining + nullish coalescing
    if (couponState?.couponApplied || couponState?.error) {
      setOpenSnackbar(true);
      if (couponState?.couponApplied) {
        setCouponCode("");
      }
    }
  }, [couponState?.couponApplied, couponState?.error]); // ✅ Safe deps

  // ✅ FIX 3: Safe cart items fallback
  const cartItems = cart?.cart?.cartItems || [];

  // Calculate Delivery Charges and Group Items dynamically
  let totalDeliveryCharges = 0;
  let maxFreeRadius = 0;
  
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

    // ✅ Extract distance dynamically from item, product, or offer. Fallback to 14.3 km if missing
    const distanceToSellerKM = (item as any).distance ?? (matchingOffer as any)?.distance ?? (item.product as any)?.distance ?? 14.3;

    // Check if delivery charge applies (base logic)
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
  }, {} as Record<string, { sellerName: string; items: CartItem[]; deliveryCharge: number; groupTotalSellingPrice: number; minFreeDelivery: number }>);

  // Second pass: Apply minFreeDelivery logic
  Object.values(cartItemsBySeller).forEach(group => {
    // If the group's total purchase exceeds the seller's minFreeDelivery threshold, waive the delivery charge
    if (group.groupTotalSellingPrice >= group.minFreeDelivery) {
      group.deliveryCharge = 0;
    }
    totalDeliveryCharges += group.deliveryCharge;
  });

  // Calculate Pricing locally so we don't need PricingCard
  const PLATFORM_FEE = cartItems.length > 0 ? 7 : 0;
  const discount = (cart.cart?.totalMrpPrice || 0) - (cart.cart?.totalSellingPrice || 0);
  const totalAmount = cartItems.length > 0 ? (cart.cart?.totalSellingPrice || 0) + PLATFORM_FEE + totalDeliveryCharges : 0;

  return (
    <div className="cart-page-wrapper">
      
      <div className="page">
        <div className="container cart-container">
          {cartItems.length > 0 ? (
            <>
              {/* Header */}
              <header className="topbar" role="banner">
                <div className="brand">
                  <button 
                    onClick={() => navigate(-1)}
                    className="lg:hidden mr-2 p-2 -ml-2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                    aria-label="Go back"
                  >
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                  </button>
                  <div className="brand__logo" aria-hidden="true">
                    <LocalMallIcon sx={{ fontSize: 24, color: '#FF5A00' }} />
                  </div>
                  <div className="brand__text">
                    <h1>Cart</h1>
                    <p className="muted">Review totals and apply coupons</p>
                  </div>
                </div>

                <div className="topbar__actions">
                  <button 
                    className="btn" 
                    onClick={() => navigate("/checkout/address")}
                    disabled={cartItems.length === 0}
                  >
                    <i className="fa-solid fa-credit-card"></i>
                    <span>Checkout</span>
                  </button>
                </div>
              </header>
              <main className="grid" role="main">
              {/* LEFT: Cart Items */}
              <section className="card" aria-label="Cart items">
                <div className="card__head">
                  <div>
                    <h2 className="card__title">Items</h2>
                    <p className="card__sub muted">Adjust quantity and review products</p>
                  </div>

                  <div className="pill" aria-live="polite">
                    <i className="fa-solid fa-cart-shopping"></i>
                    <span><span>{cartItems.length}</span> items</span>
                  </div>
                </div>

                <div className="cartList space-y-6">
                  {Object.entries(cartItemsBySeller).map(([sellerId, group]) => (
                    <div key={sellerId} className="seller-group border rounded-lg p-4 bg-gray-50/50 shadow-sm mb-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-gray-200 pb-2 gap-2">
                        <h3 className="font-semibold text-gray-700" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                          <i className="fa-solid fa-box mr-2 text-[#FF5A00]"></i>
                          Package from {group.sellerName}
                        </h3>
                        <span className={`text-sm font-medium ${group.deliveryCharge === 0 ? 'text-[#388e3c]' : 'text-gray-600'}`}>
                          Delivery: {group.deliveryCharge === 0 ? 'Free' : `₹${group.deliveryCharge}`}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {group.items.map((item: CartItem, index: number) => {
                          const uniqueKey = item._id 
                            ? `${String(item._id)}-${item.updatedAt || index}`
                            : `cart-item-${index}-${item.product?._id || 'unknown'}`;
                          
                          return <CartItemCard key={uniqueKey} item={item} />;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* RIGHT: Summary + Coupon */}
              <aside className="stack" aria-label="Summary">
                {/* Summary */}
                <section className="card" aria-label="Order summary">
                  <div className="card__head">
                    <div>
                      <h2 className="card__title">Summary</h2>
                      <p className="card__sub muted">Subtotal, discount, and total</p>
                    </div>
                  </div>

                  <div className="summaryRows">
                    <div className="row">
                      <span className="muted">Price ({cart.cart?.cartItems?.length || 0} items)</span>
                      <strong>₹{cart.cart?.totalMrpPrice || 0}</strong>
                    </div>

                    <div className="row">
                      <span className="muted">Discount</span>
                      <strong className="good">-₹{discount}</strong>
                    </div>

                    <div className="row">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="muted">Delivery Charges</span>
                        {maxFreeRadius > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-color, #1976d2)', marginTop: '2px' }}>
                            (Free within {maxFreeRadius} km)
                          </span>
                        )}
                      </div>
                      <strong className={totalDeliveryCharges === 0 ? "good" : ""}>
                        {totalDeliveryCharges === 0 ? "Free" : `₹${totalDeliveryCharges}`}
                      </strong>
                    </div>

                    <div className="row">
                      <span className="muted">Platform fee</span>
                      <strong>₹{PLATFORM_FEE}</strong>
                    </div>

                    <div className="divider"></div>

                    <div className="row row--total">
                      <span>Total</span>
                      <strong>₹{totalAmount}</strong>
                    </div>
                  </div>

                  <div className="metaLine">
                    <span className="good" style={{ color: 'var(--good)' }}>
                      You will save ₹{discount} on this order
                    </span>
                  </div>
                </section>
              </aside>
            </main>
            </>
          ) : (
            <main className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-6 w-full max-w-3xl mx-auto">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative bg-orange-50 w-44 h-44 rounded-full flex items-center justify-center shadow-inner">
                  <LocalMallIcon sx={{ fontSize: 90, color: '#FF5A00' }} className="group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">Your cart is feeling lonely</h2>
              <p className="text-gray-500 mb-10 max-w-md text-lg leading-relaxed">
                Looks like you haven't added anything yet. Discover our latest products and start filling it up!
              </p>
              <button 
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-[#FF5A00] to-[#ff7a33] text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                Start Shopping
              </button>
            </main>
          )}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={couponState?.error ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {couponState?.error || "Coupon applied successfully"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Cart;