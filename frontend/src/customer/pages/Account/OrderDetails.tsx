// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\OrderDetails.tsx
import { Box, Button, Divider, Alert, Typography, Chip, Card, Avatar, Rating, Menu, MenuItem, IconButton, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import PaymentsIcon from '@mui/icons-material/Payments';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Replay, AccountBalanceWallet, HourglassEmpty, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { cancelOrder, fetchOrderById, fetchOrderItemById } from '../../../redux/Customer/OrderSlice';
import { calculateTotalDeliveryCharges } from "../../../util/cartCalculator";
import { fetchReviewsByProductId, deleteReview } from '../../../redux/Customer/ReviewSlice';
import { fetchSellerReviews, deleteSellerReview } from '../../../redux/Customer/SellerReviewSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../Config/Api';
import dayjs from 'dayjs';
import type { ReturnRequest } from '../../../types/orderTypes';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import OrderStepper from './OrderStepper';
import ReturnRequestForm from './ReturnRequestForm';
import ReplacementRequestForm from './ReplacementRequestForm';
import SupaviewModal from '../../components/Review/SupaviewModal';
import CustomLoader from "../../../components/CustomLoader";

// Helper function to format date and time
const formatDateTime = (dateString?: string) => {
  if (!dateString) return "N/A";
  return dayjs(dateString).format("MMM DD, YYYY - h:mm A");
};

const getProductImage = (orderItem: any): string => {
  const product = orderItem?.product;
  if (!product) return "https://via.placeholder.com/120";
  if (product?.variants && orderItem?.variantId) {
    const variant = product.variants.find(
      (v: any) => String(v._id) === String(orderItem.variantId)
    );
    if (variant?.images?.[0]) return variant.images[0];
  }
  if (product?.images?.[0]) return product.images[0];
  if (product?.variants?.[0]?.images?.[0]) return product.variants[0].images[0];
  return "https://via.placeholder.com/120";
};

const getSellerName = (orderItem: any): string => {
  const seller = orderItem?.product?.seller;
  if (typeof seller === "object" && seller) {
    return seller.businessDetails?.businessName || seller.sellerName || "Seller";
  }
  return "Seller";
};

const getSellerId = (orderItem: any): string | null => {
  const seller = orderItem?.product?.seller;
  if (typeof seller === "object" && seller?._id) return String(seller._id);
  if (typeof seller === "string") return seller;
  return null;
};

const getVariantSpecs = (orderItem: any): { label: string; value: string }[] => {
  const specs: { label: string; value: string }[] = [];
  const product = orderItem?.product;
  if (!product) return [];
  if (product.variants && orderItem.variantId) {
    const variant = product.variants.find(
      (v: any) => String(v._id) === String(orderItem.variantId)
    );
    if (variant?.specifications) {
      Object.entries(variant.specifications).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const stringValue = String(value).trim();
        if (!stringValue) return;
        const formattedLabel = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^\w/, c => c.toUpperCase());
        specs.push({ label: formattedLabel, value: stringValue });
      });
      if (specs.length > 0) return specs;
    }
  }

  if (product.variants && orderItem?.size) {
    const orderColor = orderItem.size.trim();
    const matchingVariant = product.variants.find((v: any) =>
      v.color?.toLowerCase() === orderColor.toLowerCase() && v.isActive !== false
    );
    if (matchingVariant?.specifications) {
      Object.entries(matchingVariant.specifications).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const stringValue = String(value).trim();
        if (!stringValue) return;
        const formattedLabel = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^\w/, c => c.toUpperCase());
        specs.push({ label: formattedLabel, value: stringValue });
      });
      if (matchingVariant.color && !specs.some(s => s.label.toLowerCase() === 'color')) {
        specs.push({ label: 'Color', value: matchingVariant.color });
      }
      if (specs.length > 0) return specs;
    }
    if (matchingVariant?.color) {
      return [{ label: 'Color', value: matchingVariant.color }];
    }
  }

  if (orderItem?.size && orderItem.size !== 'Default') {
    if (orderItem.size.includes('+')) {
      return orderItem.size.split('+').map((part: string, idx: number) => {
        const trimmed = part.trim();
        const match = trimmed.match(/^(\d+\s*[A-Za-z]+)\s*(.*)$/);
        if (match) {
          return { label: match[2] || `Spec ${idx + 1}`, value: match[1] };
        }
        return { label: `Spec ${idx + 1}`, value: trimmed };
      });
    }
    return [{ label: 'Variant', value: orderItem.size }];
  }

  return [];
};

const OrderDetails = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orderItemId, orderId } = useParams();

  const orders = useAppSelector((state) => state.orders);
  const reviewState = useAppSelector((state) => state.review);
  const sellerReviewState = useAppSelector((state) => state.sellerReview);
  const currentUser = useAppSelector((state: any) => state.user.user);

  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [dummyState, setDummyState] = useState(0);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [returnMenuAnchor, setReturnMenuAnchor] = useState<null | HTMLElement>(null);
  const [isProductReviewOpen, setIsProductReviewOpen] = useState(false);
  const [isSellerReviewOpen, setIsSellerReviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Fetch order data
  useEffect(() => {
    if (orderItemId && orderId) {
      dispatch(fetchOrderItemById({ orderItemId, jwt: localStorage.getItem("jwt") || "" }));
      dispatch(fetchOrderById({ orderId, jwt: localStorage.getItem("jwt") || "" }));
    }
  }, [dispatch, orderId, orderItemId]);

  useEffect(() => {
    if (window.location.hash === '#review-section') {
      setTimeout(() => {
        document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Small delay to allow rendering
    }
  }, [orders.loading]);

  const item = orders.orderItem;

  // Fetch product reviews
  useEffect(() => {
    if (item?.product?._id) {
      dispatch(fetchReviewsByProductId({ productId: item.product._id }));
    }
  }, [dispatch, item?.product?._id]);

  // Fetch seller reviews
  useEffect(() => {
    const sellerId = getSellerId(item);
    if (sellerId) {
      dispatch(fetchSellerReviews({ sellerId }));
    }
  }, [dispatch, item?.product?.seller]);

  // ─── Guards ───────────────────────────────
  if (orders.loading) {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        <CustomLoader />
      </div>
    );
  }
  if (orders.error) {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        <Alert severity="error">{orders.error}</Alert>
      </div>
    );
  }
  if (!orders.currentOrder || !orders.orderItem) {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        <Alert severity="info">Order not found</Alert>
      </div>
    );
  }

  // ─── Return/Replacement Display Logic ──────
  const hasReturnRequest = (): boolean => !!(item as any)?.returnRequest;
  const hasReplacementRequest = (): boolean => !!(item as any)?.replacementRequest;

  const getReplacementStatus = () => {
    const replacementReq = (item as any)?.replacementRequest;
    if (!replacementReq?.status) return null;

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; subtext?: string }> = {
      'PENDING': { label: 'Replacement Pending', color: '#FFA500', icon: <HourglassEmpty fontSize="small" /> },
      'APPROVED': { label: 'Replacement Approved', color: '#1E90FF', icon: <CheckCircle fontSize="small" /> },
      'REJECTED': { label: 'Replacement Rejected', color: '#FF0000', icon: <Replay fontSize="small" /> },
      'ORIGINAL_RETURNED': { label: 'Original Item Returned', color: '#9C27B0', icon: <LocalShippingIcon fontSize="small" /> },
      'REVIEW_COMPLETED': { label: 'Review Completed', color: '#2196F3', icon: <CheckCircle fontSize="small" />, subtext: 'Awaiting shipment' },
      'REPLACEMENT_SHIPPED': { label: 'Replacement Shipped', color: '#FF9800', icon: <LocalShippingIcon fontSize="small" /> },
      'COMPLETED': { label: 'Replacement Completed', color: '#32CD32', icon: <CheckCircle fontSize="small" /> },
      'CANCELLED': { label: 'Replacement Cancelled', color: '#999', icon: <Replay fontSize="small" /> }
    };

    const config = statusConfig[replacementReq.status];
    if (!config) return null;

    return {
      ...config,
      tracking: replacementReq.replacementOrder?.trackingNumber
    };
  };

  const getReturnStatus = () => {
    const returnReq = (item as any)?.returnRequest;
    if (!returnReq?.status) return null;

    const getRefundTimeline = () => {
      if (returnReq.refundMethod === 'WALLET') return 'Instant';
      if (returnReq.refundMethod === 'RAZORPAY') return '2-5 days';
      return 'Pending';
    };

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; subtext?: string }> = {
      'PENDING': { label: 'Return Pending', color: '#FFA500', icon: <HourglassEmpty fontSize="small" /> },
      'APPROVED': { label: 'Return Approved', color: '#1E90FF', icon: <CheckCircle fontSize="small" /> },
      'REJECTED': { label: 'Return Rejected', color: '#FF0000', icon: <Replay fontSize="small" /> },
      'PICKED_UP': { label: 'Item Picked Up', color: '#9C27B0', icon: <LocalShippingIcon fontSize="small" /> },
      'COMPLETED': {
        label: 'Refunded',
        color: '#32CD32',
        icon: <CheckCircle fontSize="small" />,
        subtext: `₹${returnReq.refundAmount || 0} to ${returnReq.refundMethod === 'WALLET' ? 'Wallet' : 'Original Method'}`
      },
      'CANCELLED': { label: 'Return Cancelled', color: '#999', icon: <Replay fontSize="small" /> }
    };

    const config = statusConfig[returnReq.status];
    if (!config) return null;

    return {
      ...config,
      timeline: returnReq.status === 'COMPLETED' ? getRefundTimeline() : undefined
    };
  };

  // ─── Derived values ───────────────────────
  const order = orders.currentOrder;
  const sellerName = getSellerName(item);
  const sellerId = getSellerId(item);
  const imageUrl = getProductImage(item);
  const variantSpecs = getVariantSpecs(item);
  const productTitle = item?.product?.title || "Product";
  const address = order?.shippingAddress;
  const isSelfPickup = order.fulfillmentType === "SELF_PICKUP";
  const discount = (item?.mrpPrice || 0) - (item?.sellingPrice || 0);
  

  let offer: any = null;
  if (item?.product?.variants) {
    let variant = null;
    if (item.variantId) {
      variant = item.product.variants.find((v: any) => String(v._id) === String(item.variantId));
    }
    if (!variant && item.size) {
      const orderColor = item.size.trim();
      variant = item.product.variants.find((v: any) => v.color?.toLowerCase() === orderColor.toLowerCase());
    }
    if (!variant && item.product.variants.length > 0) {
      variant = item.product.variants[0];
    }

    if (variant?.offers) {
      offer = variant.offers.find((o: any) => String(o.seller?._id || o.seller) === String(sellerId));
      if (!offer && variant.offers.length > 0) {
        offer = variant.offers[0];
      }
    }
  }

  // Calculate delivery charge based on offer
  let deliveryCharge = 0;
  if (offer && offer.hasDeliveryCharge && !isSelfPickup) {
      const minFreeDelivery = offer.seller?.minFreeDelivery !== undefined ? offer.seller.minFreeDelivery : 500;
      if ((item?.sellingPrice || 0) < minFreeDelivery) {
          deliveryCharge = offer.deliveryChargePrice || 0;
      }
  }

  // Calculate total amount
  const totalAmount = (item?.sellingPrice || 0) + 7 + deliveryCharge;

  const isReturnable = offer?.isReturnable ?? false;
  const isReplaceable = offer?.isReplaceable ?? false;
  const returnTAT = parseInt(offer?.returnTAT) || 7;
  const replacementTAT = parseInt(offer?.replacementTAT) || 7;

  const deliverDate = order?.deliverDate || new Date();
  const isReturnWindowOpen = isReturnable && dayjs().isBefore(dayjs(deliverDate).add(returnTAT, 'day').endOf('day'));
  const isReplacementWindowOpen = isReplaceable && dayjs().isBefore(dayjs(deliverDate).add(replacementTAT, 'day').endOf('day'));

  const rawStatus = String(order?.orderStatus || "").toUpperCase();
  const status = rawStatus === "DELIVERY" ? "DELIVERED" : (rawStatus === "CANCELED" ? "CANCELLED" : rawStatus);
  const isDelivered = status === "DELIVERED";
  const isShipped = status === "SHIPPED";
  const isArriving = status === "ARRIVING";
  const isConfirmed = status === "CONFIRMED";
  const isPending = status === "PENDING";

  // My product review
  const myReview = reviewState.reviews.find(
    (review: any) =>
      String(review.user?._id) === String(currentUser?._id) &&
      String(review.product?._id || review.product) === String(item?.product?._id) &&
      String(review.orderItem?._id || review.orderItem) === String(item?._id)
  );

  // Seller reviews & my seller review
  const sellerReviews = sellerId
    ? sellerReviewState.reviewsBySeller[sellerId] || []
    : [];

  const mySellerReview = sellerReviews.find(
    (r: any) => 
      String(r.user?._id) === String(currentUser?._id) &&
      String(r.orderItem?._id || r.orderItem) === String(item?._id)
  );

  // Seller rating summary
  const sellerRatingCount = sellerReviews.length;
  const sellerRatingAvg =
    sellerRatingCount > 0
      ? (
        sellerReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        sellerRatingCount
      ).toFixed(1)
      : null;

  const handleCancelOrder = () => {
    if (orderId) dispatch(cancelOrder(orderId));
  };

  const handleDeleteProductReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (myReview && window.confirm("Are you sure you want to delete this product review?")) {
      await dispatch(deleteReview({ reviewId: myReview._id, jwt: localStorage.getItem("jwt") || "" }));
      if (item?.product?._id) {
        dispatch(fetchReviewsByProductId({ productId: item.product._id }));
      }
    }
  };

  const handleDeleteSellerReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mySellerReview && sellerId && window.confirm("Are you sure you want to delete this seller review?")) {
      await dispatch(deleteSellerReview({ reviewId: mySellerReview._id, sellerId, jwt: localStorage.getItem("jwt") || "" }));
      dispatch(fetchSellerReviews({ sellerId }));
    }
  };

  // ─── Razorpay Payment Integration ───
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayOnline = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setSnackbarMsg('Failed to load Razorpay SDK. Please check your internet connection.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Fetch Razorpay order ID from backend
      const response = await api.post(`/api/orders/${orderId}/payment-link`, {}, {
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") }
      });
      const { razorpayOrder } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SmO760j2VBTxSH', // Your Key ID
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.order_id,
        name: 'Near Look',
        description: 'Order Payment',
        prefill: {
          name: currentUser?.fullName || 'Customer',
          email: currentUser?.email || '',
          contact: currentUser?.mobile || ''
        },
        handler: async function (response: any) {
          try {
            await api.put(`/api/orders/${orderId}/payment-success`, {
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id
            }, {
              headers: { Authorization: "Bearer " + localStorage.getItem("jwt") }
            });
            
            // Refresh order data from backend
            if (orderId && orderItemId) {
              dispatch(fetchOrderById({ orderId, jwt: localStorage.getItem("jwt") || "" }));
              dispatch(fetchOrderItemById({ orderItemId, jwt: localStorage.getItem("jwt") || "" }));
            }
          } catch (err) {
            console.error("Error updating payment status:", err);
            setSnackbarMsg("Payment succeeded but failed to update status. Please refresh the page.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          }
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setSnackbarMsg("Payment failed: " + (response.error.description || response.error.reason));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
      rzp.open();
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      setSnackbarMsg("Could not initialize payment. Please try again later.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Helper: Get return status for this order item
  const getItemReturnStatus = (): ReturnRequest | null => {
    return orders.orderItem?.returnRequest || null;
  };

  // Helper: Format return status display
  const getReturnStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pending Approval', color: '#FFA500' as const };
      case 'APPROVED': return { label: 'Approved - Awaiting Pickup', color: '#1E90FF' as const };
      case 'REJECTED': return { label: 'Rejected', color: '#FF0000' as const };
      case 'PICKED_UP': return { label: 'Picked Up - Processing', color: '#9C27B0' as const };
      case 'COMPLETED': return { label: 'Refunded to Wallet', color: '#32CD32' as const };
      case 'CANCELLED': return { label: 'Cancelled', color: '#999' as const };
      default: return { label: status, color: '#999' as const };
    }
  };

  // Check if any item has pending return (for cancel button logic)
  const hasPendingReturn = orders.currentOrder?.orderItems?.some(
    (item: any) => item.returnRequest?.status === 'PENDING'
  );

  const handleDownloadInvoice = () => {
    if (!order || !item) return;
    
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #1a1a1a; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-block { width: 45%; }
            h3 { margin-bottom: 10px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
            <div>
              <strong>Order ID:</strong> ${orderId}<br/>
              <strong>Date:</strong> ${formatDateTime(order.orderDate)}
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-block">
              <h3>Billed To:</h3>
              ${address?.name || currentUser?.fullName || 'Customer'}<br/>
              ${address?.address || ''}, ${address?.city || ''}<br/>
              ${address?.state || ''} - ${address?.pinCode || ''}<br/>
              Mobile: ${address?.mobile || currentUser?.mobile || ''}
            </div>
            <div class="info-block">
              <h3>Sold By:</h3>
              ${sellerName}<br/>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${productTitle}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${item.sellingPrice || 0}</td>
                <td>₹${(item.sellingPrice || 0) * (item.quantity || 1)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: right">Grand Total:</td>
                <td>₹${(item.sellingPrice || 0) * (item.quantity || 1)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px;">
            <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash On Delivery'}<br/>
            <strong>Payment Status:</strong> ${order.paymentStatus || 'Pending'}
          </div>
          
          <div class="footer">
            Thank you for shopping with us!<br/>
            This is a computer generated invoice and does not require a signature.
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      // small delay to allow CSS to render
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="w-full bg-[#F1F3F6] p-4 sm:p-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN (Half Screen) ─── */}
        <div className="space-y-4">
          
          {/* Payment Banner (If Pending) */}
          {orders.currentOrder?.paymentStatus !== "COMPLETED" && orders.currentOrder?.paymentMethod !== "RAZORPAY" && (
            <Card className="p-4 flex flex-col sm:flex-row items-center justify-between rounded-md shadow-sm border border-gray-100 gap-4 sm:gap-0">
              <Typography variant="body2" color="text.secondary">Pay online for a smooth doorstep experience</Typography>
              <Button 
                variant="outlined" 
                onClick={handlePayOnline}
                sx={{ color: '#FF5A00', borderColor: '#FF5A00', textTransform: 'none', px: 4, fontWeight: 'bold' }}
              >
                Pay ₹{totalAmount}
              </Button>
            </Card>
          )}

          {/* Product & Tracking Card */}
          <Card className="rounded-md shadow-sm border border-gray-100">
            {/* Top: Product Info */}
            <div className="p-5 flex justify-between items-start">
              <div className="w-[75%] pr-4">
                <Typography className="text-gray-900 font-medium text-[15px] leading-tight mb-2">
                  {productTitle}
                </Typography>
                <Typography variant="caption" className="text-gray-500 block mb-1">
                  Seller: {sellerName}
                </Typography>
                <div className="flex items-center gap-3 mt-1">
                  <Typography component="p" variant="h6" className="font-bold text-[18px]">₹{item?.sellingPrice}</Typography>
                  {discount > 0 && <Typography variant="caption" className="text-[#15803d] font-medium">{discount} offer</Typography>}
                </div>
              </div>
              <div className="w-[80px] h-[80px] shrink-0">
                <img src={imageUrl} alt="product" className="w-full h-full object-contain" />
              </div>
            </div>

            <Divider />

            {/* Middle: Stepper Tracking */}
            <div className="p-4 sm:p-6">
              {/* ✅ Return Status Badge */}
              {hasReturnRequest() && (() => {
                const returnReq = (item as any)?.returnRequest;
                const returnStatus = getReturnStatus();
                if (!returnStatus) return null;

                const isProcessingRazorpay =
                  returnReq?.refundMethod === 'RAZORPAY' &&
                  (returnReq?.refundStatus === 'PROCESSING' || returnReq?.refundStatus === 'PENDING');

                return (
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      icon={returnStatus.icon as React.ReactElement | undefined}
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight="bold">{returnStatus.label}</Typography>
                          {returnStatus.subtext && (
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                              {returnStatus.subtext}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{
                        backgroundColor: `${returnStatus.color}20`,
                        color: returnStatus.color,
                        fontWeight: 'bold',
                        border: `1px solid ${returnStatus.color}40`,
                        py: 2,
                        px: 1,
                        width: '100%',
                        justifyContent: 'flex-start'
                      }}
                    />
                    {isProcessingRazorpay && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', animation: 'pulse 1.5s infinite' }} />
                        <Typography variant="caption" color="warning.main" fontWeight="medium">
                          ⏳ Processing refund to Razorpay...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })()}

              {/* ✅ Replacement Status Badge */}
              {hasReplacementRequest() && (() => {
                const replacementStatus = getReplacementStatus();
                if (!replacementStatus) return null;

                return (
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      icon={replacementStatus.icon as React.ReactElement | undefined}
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight="bold">{replacementStatus.label}</Typography>
                          {replacementStatus.subtext && (
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                              {replacementStatus.subtext}
                            </Typography>
                          )}
                          {replacementStatus.tracking && (
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 'bold', mt: 0.5 }}>
                              📦 Tracking: {replacementStatus.tracking}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{
                        backgroundColor: `${replacementStatus.color}20`,
                        color: replacementStatus.color,
                        fontWeight: 'bold',
                        border: `1px solid ${replacementStatus.color}40`,
                        py: 2,
                        px: 1,
                        width: '100%',
                        justifyContent: 'flex-start'
                      }}
                    />
                  </Box>
                );
              })()}

              <OrderStepper 
                orderStatus={status} 
                fulfillmentType={order.fulfillmentType as 'DELIVERY' | 'SELF_PICKUP'}
                orderDate={order.orderDate}
                updatedAt={order.updatedAt}
                deliverDate={order.deliverDate}
                pickupTime={order.pickupTime ?? undefined}
                returnRequest={(item as any)?.returnRequest}
                replacementRequest={(item as any)?.replacementRequest}
              />

              {/* Delivery Agent info (Mocked based on Flipkart screenshot) */}
              {isArriving && (
                 <div className="mt-6 pt-4 border-t border-gray-100">
                    <Typography variant="caption" className="text-gray-500 block mb-3">Delivery Executive might not respond while driving</Typography>
                    <div className="flex items-center justify-between">
                       <Typography variant="body2" className="text-gray-700">
                         You can reach the delivery person at <strong>04440467777</strong> PIN: 135
                       </Typography>
                       <Button variant="outlined" size="small" sx={{ textTransform: 'none', color: '#FF5A00', borderColor: '#FF5A00', py: 0.5 }}>
                          Call
                       </Button>
                    </div>
                 </div>
              )}
            </div>

            <Divider />

            {/* Bottom Actions */}
            <div className="flex">
              <div 
                onClick={(e) => {
                  if (hasReturnRequest() || hasReplacementRequest()) return;
                  if (isShipped || isDelivered) {
                    if (isReturnWindowOpen && isReplacementWindowOpen) {
                      setReturnMenuAnchor(e.currentTarget);
                    } else if (isReturnWindowOpen) {
                      setIsReturnModalOpen(true);
                    } else if (isReplacementWindowOpen) {
                      setIsReplacementModalOpen(true);
                    }
                  } else {
                    handleCancelOrder();
                  }
                }} 
                className={`w-full p-3 text-center flex justify-center items-center ${hasReturnRequest() || hasReplacementRequest() || ((isShipped || isDelivered) && !isReturnWindowOpen && !isReplacementWindowOpen) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'}`}
              >
                 <Typography className="text-[14px] font-medium text-gray-700">
                   {isShipped || isDelivered 
                     ? (!isReturnWindowOpen && !isReplacementWindowOpen 
                         ? "Return Window Closed" 
                         : (isReturnWindowOpen && isReplacementWindowOpen) 
                             ? "Return / Replace" 
                             : isReturnWindowOpen ? "Return" : "Replace") 
                     : "Cancel"}
                 </Typography>
              </div>
              
              <Menu
                anchorEl={returnMenuAnchor}
                open={Boolean(returnMenuAnchor)}
                onClose={() => setReturnMenuAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                {isReturnWindowOpen && (
                  <MenuItem onClick={() => { setIsReturnModalOpen(true); setReturnMenuAnchor(null); }}>
                     Return
                  </MenuItem>
                )}
                {isReplacementWindowOpen && (
                  <MenuItem onClick={() => { setIsReplacementModalOpen(true); setReturnMenuAnchor(null); }}>
                     Replacement
                  </MenuItem>
                )}
              </Menu>
            </div>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN (Half Screen) ─── */}
        <div className="space-y-4">
           
           {/* Delivery/Pickup Details Card */}
           <Card className="p-5 rounded-md shadow-sm border border-gray-100">
              <Typography className="font-semibold text-[15px] mb-4 text-gray-800">
                {orders.currentOrder?.fulfillmentType === 'SELF_PICKUP' ? 'Pickup Address' : 'Delivery details'}
              </Typography>
              <div className="flex gap-3 mb-4">
                 {orders.currentOrder?.fulfillmentType === 'SELF_PICKUP' ? (
                   <StorefrontIcon sx={{color: '#878787', fontSize: 20}} />
                 ) : (
                   <HomeWorkOutlinedIcon sx={{color: '#878787', fontSize: 20}} />
                 )}
                 <div>
                    <Typography className="text-[14px] font-medium text-gray-800 mb-1">
                      {address?.locality || 'Home'}
                    </Typography>
                    <Typography className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">
                       {address?.address}, {address?.city}, {address?.state} - {address?.pinCode}
                    </Typography>
                 </div>
              </div>
              <div className="flex gap-3 items-center">
                 {orders.currentOrder?.fulfillmentType === 'SELF_PICKUP' ? (
                   <CallOutlinedIcon sx={{color: '#878787', fontSize: 20}} />
                 ) : (
                   <PersonOutlineOutlinedIcon sx={{color: '#878787', fontSize: 20}} />
                 )}
                 <Typography className="text-[13px] text-gray-800">
                    {orders.currentOrder?.fulfillmentType === 'SELF_PICKUP' ? 'Phone Number:' : address?.name} 
                    <span className="ml-2 font-medium">{address?.mobile}</span>
                 </Typography>
              </div>

              {orders.currentOrder?.fulfillmentType === 'SELF_PICKUP' && orders.currentOrder?.seller?.location?.coordinates && (
                 <div className="mt-4">
                     <Button 
                       variant="outlined" 
                       size="small" 
                       startIcon={<MapOutlinedIcon />}
                       sx={{ textTransform: 'none', borderColor: '#e0e0e0', color: '#1976d2', borderRadius: '6px' }}
                       onClick={() => {
                          const coords = orders.currentOrder!.seller.location.coordinates;
                          const lat = coords[1];
                          const lng = coords[0];
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                       }}
                     >
                       Navigate to Store
                     </Button>
                 </div>
              )}
           </Card>

           {/* Price Details Card */}
           <Card className="rounded-md shadow-sm border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100">
               <h2 className="text-[16px] font-medium text-gray-600 uppercase tracking-wide">
                 Price Details
               </h2>
             </div>

             <div className="space-y-4 px-6 py-5 text-[16px]">
               {/* Subtotal (MRP) */}
               <div className="flex justify-between items-center text-[#212121]">
                 <span>Price ({item?.quantity || 1} item{(item?.quantity || 1) !== 1 ? 's' : ''})</span>
                 <span>₹{item?.mrpPrice || 0}</span>
               </div>
               
               {/* Discount */}
               <div className="flex justify-between items-center text-[#212121]">
                 <span>Discount</span>
                 <span className="text-[#15803d]">- ₹{discount || 0}</span>
               </div>
               
               {/* Shipping */}
               <div className="flex justify-between items-center text-[#212121]">
                 <span>Delivery Charges</span>
                 <span className={deliveryCharge === 0 ? "text-[#15803d]" : ""}>
                   {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}
                 </span>
               </div>
               
               {/* Platform fee */}
               <div className="flex justify-between items-center text-[#212121]">
                 <span>Platform fee</span>
                 <span>₹7</span>
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

             <div className="p-5 pt-0">
                  <div className="flex justify-between items-center p-3 bg-[#f9f9f9] rounded-md border border-gray-200 mt-2">
                      <Typography className="text-[13px] text-gray-600">Paid By</Typography>
                      <div className="flex gap-2 items-center">
                          <PaymentsIcon sx={{fontSize: 16, color: '#878787'}}/>
                          <Typography className="text-[13px] font-medium text-gray-800">
                            {orders.currentOrder?.paymentMethod || "Cash On Delivery"}
                          </Typography>
                      </div>
                  </div>

                  {isDelivered && (
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<DownloadOutlinedIcon sx={{fontSize: 18}}/>} 
                      onClick={handleDownloadInvoice}
                      sx={{
                        textTransform: 'none', 
                        color: '#212121', 
                        borderColor: '#e0e0e0', 
                        mt: 3, 
                        py: 1,
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#f5f5f5', borderColor: '#e0e0e0' }
                      }}
                    >
                       Download Invoice
                    </Button>
                  )}
             </div>
           </Card>

          {/* Rate Experience (Moved to right column) */}
          {isDelivered && (
            <Card id="review-section" className="p-5 rounded-md shadow-sm border border-gray-100 flex flex-col gap-4">
                <Typography className="font-semibold text-gray-800 text-[15px]">Rate your experience</Typography>
                
                {/* Product Review */}
                <div 
                  onClick={() => setIsProductReviewOpen(true)}
                  className="flex flex-wrap gap-y-3 gap-x-6 justify-center items-center border border-gray-200 p-4 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                   <div className="flex gap-4 items-center">
                      <StarIcon sx={{fontSize: 20, color: myReview ? '#FFC107' : '#878787'}}/>
                      <Typography className="text-[14px] text-gray-700">{myReview ? 'Edit Product Review' : 'Review Product'}</Typography>
                   </div>
                   <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} sx={{fontSize: 24, color: myReview && star <= myReview.rating ? '#FFC107' : '#e0e0e0'}} />
                      ))}
                      {myReview && (
                        <IconButton size="small" onClick={handleDeleteProductReview} sx={{ ml: 1 }}>
                          <DeleteOutlineIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                        </IconButton>
                      )}
                   </div>
                </div>

                {/* Seller Review */}
                <div 
                  onClick={() => setIsSellerReviewOpen(true)}
                  className="flex flex-wrap gap-y-3 gap-x-6 justify-center items-center border border-gray-200 p-4 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                   <div className="flex gap-4 items-center">
                      <StorefrontIcon sx={{fontSize: 20, color: mySellerReview ? '#FFC107' : '#878787'}}/>
                      <Typography className="text-[14px] text-gray-700">{mySellerReview ? 'Edit Seller Review' : 'Review Seller'}</Typography>
                   </div>
                   <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} sx={{fontSize: 24, color: mySellerReview && star <= mySellerReview.rating ? '#FFC107' : '#e0e0e0'}} />
                      ))}
                      {mySellerReview && (
                        <IconButton size="small" onClick={handleDeleteSellerReview} sx={{ ml: 1 }}>
                          <DeleteOutlineIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                        </IconButton>
                      )}
                   </div>
                </div>
            </Card>
          )}

        </div>
      </div>
      {/* Order ID Footer */}
      <div className="px-1 mt-6">
         <Typography variant="caption" className="text-gray-700 font-medium">Order #{orderId}</Typography>
      </div>

      {item && (
        <ReturnRequestForm 
          open={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            // Refetch to get the updated status
            if (item?._id && orderId) {
              dispatch(fetchOrderItemById({ orderItemId: item._id, jwt: localStorage.getItem("jwt") || "" }));
            }
          }}
          orderItemId={item._id}
          itemDetails={{
            title: productTitle,
            sellingPrice: item.sellingPrice,
            image: imageUrl,
            variant: item.size,
            paymentMethod: order.paymentMethod
          }}
        />
      )}
      
      {item && (
        <ReplacementRequestForm
          open={isReplacementModalOpen}
          onClose={() => {
            setIsReplacementModalOpen(false);
            // Refetch to get the updated status
            if (item?._id && orderId) {
              dispatch(fetchOrderItemById({ orderItemId: item._id, jwt: localStorage.getItem("jwt") || "" }));
            }
          }}
          orderItem={item}
          orderId={order._id}
        />
      )}
      
      <SupaviewModal
        open={isProductReviewOpen}
        onClose={() => setIsProductReviewOpen(false)}
        reviewType="product"
        targetId={item?.product?._id}
        orderItemId={item?._id}
        existingReview={myReview}
      />

      <SupaviewModal
        open={isSellerReviewOpen}
        onClose={() => setIsSellerReviewOpen(false)}
        reviewType="seller"
        targetId={order?.seller?._id || sellerId || undefined}
        orderItemId={item?._id}
        existingReview={mySellerReview}
      />
      
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OrderDetails;