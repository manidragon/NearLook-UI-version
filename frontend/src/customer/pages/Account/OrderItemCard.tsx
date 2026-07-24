import React, { useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Button from "../../../components/NeonButton";
import { Avatar, Box, Typography, Chip } from "@mui/material";
import { teal } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderItem } from '../../../types/orderTypes';
import { formatDate } from '../../util/fomateDate';
import dayjs from 'dayjs';
import { Replay, HourglassEmpty, CheckCircle, Payment, AttachMoney } from '@mui/icons-material';

// ✅ Helper: Format date and time
const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
};

// ✅ Helper: Safely get product image
const getProductImage = (item: OrderItem): string => {
  if (item.product?.variants && item.variantId) {
    const variant = item.product.variants.find((v: any) =>
      String(v._id) === String(item.variantId)
    );
    if (variant?.images?.[0]) return variant.images[0];
  }
  if (item.product?.images?.[0]) return item.product.images[0];
  if (item.product?.variants?.[0]?.images?.[0]) return item.product.variants[0].images[0];
  return 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect width="70" height="70" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="8" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
};

// ✅ Helper: Get seller name
const getSellerName = (item: OrderItem, order: Order): string => {
  if (typeof item.product?.seller === 'object' && item.product.seller) {
    if (item.product.seller.businessDetails?.businessName) return item.product.seller.businessDetails.businessName;
    if (item.product.seller.sellerName) return item.product.seller.sellerName;
  }
  if (typeof order?.seller === 'object' && order.seller) {
    if (order.seller.businessDetails?.businessName) return order.seller.businessDetails.businessName;
    if (order.seller.sellerName) return order.seller.sellerName;
  }
  return 'Seller';
};

const getVariantSpecs = (item: OrderItem): { label: string; value: string }[] => {
  const specs: { label: string; value: string }[] = [];
  const product = item?.product;
  if (!product) return [];

  if (product.variants && item.variantId) {
    const variant = product.variants.find((v: any) => String(v._id) === String(item.variantId));
    if (variant?.specifications) {
      Object.entries(variant.specifications).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const stringValue = String(value).trim();
        if (!stringValue) return;
        const formattedLabel = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
        specs.push({ label: formattedLabel, value: stringValue });
      });
      if (specs.length > 0) return specs;
    }
  }

  if (product.variants && item?.size) {
    const orderColor = item.size.trim();
    const matchingVariant = product.variants.find((v: any) => v.color?.toLowerCase() === orderColor.toLowerCase() && v.isActive !== false);
    if (matchingVariant?.specifications) {
      Object.entries(matchingVariant.specifications).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const stringValue = String(value).trim();
        if (!stringValue) return;
        const formattedLabel = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
        specs.push({ label: formattedLabel, value: stringValue });
      });
      if (matchingVariant.color && !specs.some(s => s.label.toLowerCase() === 'color')) {
        specs.push({ label: 'Color', value: matchingVariant.color });
      }
      if (specs.length > 0) return specs;
    }
    if (matchingVariant?.color) return [{ label: 'Color', value: matchingVariant.color }];
  }

  if (item.size && item.size !== 'Default') {
    if (item.size.includes('+')) {
      return item.size.split('+').map((part, idx) => {
        const trimmed = part.trim();
        const match = trimmed.match(/^(\d+\s*[A-Za-z]+)\s*(.*)$/);
        if (match) return { label: match[2] || `Spec ${idx + 1}`, value: match[1] };
        return { label: `Spec ${idx + 1}`, value: trimmed };
      });
    }
    return [{ label: 'Variant', value: item.size }];
  }
  return [];
};

interface OrderItemCardProps {
  item: OrderItem;
  order: Order;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, order }) => {
  const navigate = useNavigate();

  const imageUrl = getProductImage(item);
  const sellerName = getSellerName(item, order);
  const productTitle = item.product?.title || 'Product title not available';
  const variantSpecs = getVariantSpecs(item);
  const isSelfPickup = order.fulfillmentType === 'SELF_PICKUP';

  const hasReturnRequest = (): boolean => {
    return !!(item as any).returnRequest;
  };

  const hasReplacementRequest = (): boolean => {
    return !!(item as any).replacementRequest;
  };

  // ✅ NEW: Get replacement status configuration for display
  const getReplacementStatus = () => {
    const replacementReq = (item as any).replacementRequest;
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

  // ✅ Helper: Get return status configuration for display
  const getReturnStatus = () => {
    const returnReq = (item as any).returnRequest;
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
        label: 'Refund Completed',
        color: '#32CD32',
        icon: <CheckCircle fontSize="small" />,
        subtext: `₹${returnReq.refundAmount} to ${returnReq.refundMethod === 'WALLET' ? 'Wallet' : 'Original Method'}`
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

  return (
    <div
      onClick={() => navigate(`/account/orders/${order._id}/item/${item._id}`)}
      className='bg-white p-3 lg:p-5 border border-gray-100 rounded-2xl cursor-pointer hover:shadow-md hover:border-[#FF5A00]/30 transition-all flex flex-col md:flex-row gap-4 md:items-center justify-between'
    >
      {/* Product Image & Details */}
      <div className='flex gap-4 w-full md:w-[65%]'>
        <Box sx={{ flexShrink: 0 }} className="bg-[#F1F3F6] p-2 rounded-xl">
          <img
            className='w-[75px] h-[75px] object-contain mix-blend-multiply'
            src={imageUrl}
            alt={productTitle}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect width="70" height="70" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="8" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }} className="flex flex-col justify-center">
          <Typography className="text-[14px] lg:text-[15px] font-semibold text-gray-800 line-clamp-2 leading-tight">
            {productTitle}
          </Typography>
          {variantSpecs.length > 0 && (
            <Typography className="text-[12px] text-gray-500 mt-1 line-clamp-1">
              {variantSpecs.map(spec => `${spec.value}`).join(', ')}
            </Typography>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Typography className="text-[15px] font-bold text-[#FF5A00]">
              ₹{(item.sellingPrice || 0).toFixed(0)}
            </Typography>
            {item.quantity && item.quantity > 1 && (
              <Typography className="text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Qty: {item.quantity}
              </Typography>
            )}
          </div>
        </Box>
      </div>

      {/* Status & Delivery */}
      <div className='flex flex-col space-y-2 w-full md:w-[35%]'>
        {hasReturnRequest() ? (() => {
          const returnReq = (item as any).returnRequest;
          const returnStatus = getReturnStatus();
          if (!returnStatus) return null;

          return (
            <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg'>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFA500' }} />
              <div className="flex-1">
                <Typography className="text-[13px] font-medium text-gray-800">
                  {returnStatus.label}
                </Typography>
              </div>
            </div>
          );
        })() : hasReplacementRequest() ? (() => {
          const replacementReq = (item as any).replacementRequest;
          const replacementStatus = getReplacementStatus();
          if (!replacementStatus) return null;

          return (
            <div className='flex items-start gap-2'>
              <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: '#FFA500' }} />
              <div>
                <Typography className="text-[14px] font-medium text-[#212121]">
                  {replacementStatus.label}
                </Typography>
                <Typography className="text-[12px] text-[#878787] mt-1">
                  You requested a replacement. Reason: {replacementReq.reason}
                </Typography>

                <div 
                  className="flex items-center gap-1 mt-3 text-[#2874F0] hover:text-[#1a5bb8] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/account/orders/${order._id}/item/${item._id}#review-section`);
                  }}
                >
                  <span className="text-[16px] leading-none mb-0.5">★</span>
                  <Typography className="text-[13px] font-medium">
                    Rate & Review Product
                  </Typography>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className='flex items-start gap-2'>
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-[#26a541]" />
            <div>
              <Typography className="text-[14px] font-medium text-[#212121]">
                {order.orderStatus === 'CANCELLED' ? 'Cancelled on' : (order.orderStatus === 'DELIVERED' ? 'Delivered on' : 'Expected delivery by')} {order.orderStatus === 'CANCELLED' ? formatDate(order.updatedAt || order.orderDate) : (isSelfPickup && order.pickupTime ? formatDateTime(order.pickupTime) : formatDate(order.deliverDate))}
              </Typography>
              <Typography className="text-[12px] text-[#878787] mt-1">
                {order.orderStatus === 'CANCELLED' ? 'Your order has been cancelled' : (isSelfPickup ? 'Self Pickup from store' : 'Your item has been delivered')}
              </Typography>

              {/* Rate & Review link for delivered items */}
              {order.orderStatus === 'DELIVERED' && (
                <div 
                  className="flex items-center gap-1 mt-3 text-[#2874F0] hover:text-[#1a5bb8] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/account/orders/${order._id}/item/${item._id}#review-section`);
                  }}
                >
                  <span className="text-[16px] leading-none mb-0.5">★</span>
                  <Typography className="text-[13px] font-medium">
                    Rate & Review Product
                  </Typography>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>  // ✅ This closes the main container div
  );
};

export default OrderItemCard;