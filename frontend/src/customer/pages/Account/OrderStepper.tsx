import React from "react";
import dayjs from "dayjs";

// Custom TrackLoom styles ported to React
const trackloomStyles = `
  .trackloom-stepper {
      --bg: transparent;
      --surface: rgba(8, 10, 22, 0.04);
      --surface2: rgba(8, 10, 22, 0.06);
      --stroke: rgba(8, 10, 22, 0.12);
      --text: rgba(6, 8, 18, 0.88);
      --muted: rgba(6, 8, 18, 0.64);
      --brand: #2bb5b8;
      --brand2: #6a60ff;
      --ok: #178e47;
      font-family: inherit;
  }
  
  .tl-timeline {
      position: relative;
      display: grid;
      gap: 12px;
      padding: 10px 6px 6px;
  }
  
  .tl-rail {
      position: absolute;
      left: 26px; /* Centered with tl-pin: timeline-padding(6) + step-padding(10) + pin-margin(2) + pin-half-width(9) - rail-half-width(1) = 26px */
      top: 31px;
      bottom: 60px;
      width: 2px;
      background: rgba(8, 10, 22, 0.14);
      border-radius: 99px;
      overflow: hidden;
  }
  
  .tl-fill {
      width: 100%;
      background: linear-gradient(180deg, var(--brand), var(--brand2));
      border-radius: 99px;
      transition: height 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  
  .tl-step {
      display: grid;
      grid-template-columns: 26px 1fr;
      gap: 16px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid transparent;
      transition: transform 240ms ease, background 240ms ease, border 240ms ease, box-shadow 240ms ease;
      position: relative;
      z-index: 1;
  }
  
  .tl-step:hover {
      background: var(--surface);
      transform: translateY(-2px);
      border-color: rgba(43, 181, 184, 0.18);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  }
  
  .tl-pin {
      width: 18px;
      height: 18px;
      border-radius: 99px;
      margin-left: 2px;
      margin-top: 2px;
      border: 2px solid rgba(8, 10, 22, 0.22);
      background: #ffffff;
      transition: all 240ms ease;
      position: relative;
      z-index: 2;
  }
  
  .tl-step-title {
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--text);
  }
  
  .tl-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: rgba(8, 10, 22, 0.04);
      border: 1px solid rgba(8, 10, 22, 0.1);
      transition: all 240ms ease;
  }
  
  .tl-icon svg {
      width: 16px;
      height: 16px;
      stroke-width: 2.5;
  }
  
  .tl-step-sub {
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
  }
  
  .tl-step.is-done .tl-pin,
  .tl-step.is-active .tl-pin {
      border-color: rgba(43, 181, 184, 0.7);
      background: #e4f5f5; /* Solid light teal instead of transparent */
      box-shadow: 0 0 0 6px rgba(43, 181, 184, 0.12);
  }
  
  .tl-step.is-done .tl-icon,
  .tl-step.is-active .tl-icon {
      background: linear-gradient(135deg, rgba(43, 181, 184, 0.12), rgba(106, 96, 255, 0.1));
      border-color: rgba(43, 181, 184, 0.22);
      color: var(--brand);
  }
  
  .tl-step.is-cancelled .tl-pin {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.2);
      box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.12);
  }
  
  .tl-step.is-cancelled .tl-icon {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
  }
`;

// TrackLoom SVG Icons
const ReceiptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M7 3h10a2 2 0 0 1 2 2v16l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V5a2 2 0 0 1 2-2Z" />
    <path d="M8 7h8M8 11h8M8 15h6" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M21 8l-9 5-9-5 9-5 9 5Z" />
    <path d="M21 8v8l-9 5-9-5V8" />
    <path d="M12 13v10" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M3 7h11v10H3z" />
    <path d="M14 10h4l3 3v4h-7z" />
    <path d="M7 19a2 2 0 1 0 0-.01" />
    <path d="M18 19a2 2 0 1 0 0-.01" />
  </svg>
);

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M6 20a2 2 0 1 0 0-.01M18 4a2 2 0 1 0 0-.01" />
    <path d="M6 18c0-5 12-1 12-10" />
    <path d="M13 8h5V3" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export interface OrderStepperProps {
  orderStatus: string;
  fulfillmentType?: 'DELIVERY' | 'SELF_PICKUP';
  orderDate?: string;
  updatedAt?: string;
  deliverDate?: string;
  pickupTime?: string;
  returnRequest?: any;
  replacementRequest?: any;
}

const OrderStepper: React.FC<OrderStepperProps> = ({
  orderStatus,
  fulfillmentType = 'DELIVERY',
  orderDate,
  updatedAt,
  deliverDate,
  pickupTime,
  returnRequest,
  replacementRequest
}) => {
  // logic to format date
  const fd = (d: any) => d ? dayjs(d).format("MMM DD") : '';

  let steps: any[] = [];
  let currentIndex = 0;
  let currentMainStatus = orderStatus;

  if (returnRequest) {
    currentMainStatus = returnRequest.status;
    const reqDate = fd(returnRequest.createdAt || new Date());
    
    if (returnRequest.status === 'REJECTED') {
      steps = [
        { name: "Return Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Return Rejected", icon: <CloseIcon />, value: "REJECTED", isCancelled: true }
      ];
      currentIndex = 1;
    } else if (returnRequest.status === 'CANCELLED') {
      steps = [
        { name: "Return Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Return Cancelled", icon: <CloseIcon />, value: "CANCELLED", isCancelled: true }
      ];
      currentIndex = 1;
    } else {
      steps = [
        { name: "Return Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Approved", icon: <CheckIcon />, value: "APPROVED" },
        { name: "Picked Up", icon: <BoxIcon />, value: "PICKED_UP" },
        { name: "Refunded", description: returnRequest.refundMethod ? `To ${returnRequest.refundMethod}` : '', icon: <CheckIcon />, value: "COMPLETED" }
      ];
      const statuses = steps.map(s => s.value);
      currentIndex = statuses.indexOf(returnRequest.status);
      if (currentIndex === -1) currentIndex = 0;
    }
  } else if (replacementRequest) {
    currentMainStatus = replacementRequest.status;
    const reqDate = fd(replacementRequest.createdAt || new Date());
    
    if (replacementRequest.status === 'REJECTED') {
      steps = [
        { name: "Replacement Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Replacement Rejected", icon: <CloseIcon />, value: "REJECTED", isCancelled: true }
      ];
      currentIndex = 1;
    } else if (replacementRequest.status === 'CANCELLED') {
      steps = [
        { name: "Replacement Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Replacement Cancelled", icon: <CloseIcon />, value: "CANCELLED", isCancelled: true }
      ];
      currentIndex = 1;
    } else {
      steps = [
        { name: "Replacement Requested", description: reqDate, icon: <ReceiptIcon />, value: "PENDING" },
        { name: "Approved", icon: <CheckIcon />, value: "APPROVED" },
        { name: "Original Item Returned", icon: <BoxIcon />, value: "ORIGINAL_RETURNED" },
        { name: "Review Completed", icon: <CheckIcon />, value: "REVIEW_COMPLETED" },
        { name: "Replacement Shipped", icon: <TruckIcon />, value: "REPLACEMENT_SHIPPED" },
        { name: "Completed", icon: <CheckIcon />, value: "COMPLETED" }
      ];
      const statuses = steps.map(s => s.value);
      currentIndex = statuses.indexOf(replacementRequest.status);
      if (currentIndex === -1) currentIndex = 0;
    }
  } else if (orderStatus === 'CANCELLED') {
    steps = [
      { name: "Ordered", description: `Order Placed • ${fd(orderDate)}`, icon: <ReceiptIcon />, value: "PLACED", isCancelled: false },
      { name: "Cancelled", description: `Order Cancelled • ${fd(updatedAt)}`, icon: <CloseIcon />, value: "CANCELLED", isCancelled: true }
    ];
    currentIndex = 1;
  } else if (fulfillmentType === 'SELF_PICKUP') {
    steps = [
      { name: "Ordered", description: `Order Placed • ${fd(orderDate)}`, icon: <ReceiptIcon />, value: "PLACED" },
      { name: "Confirmed", icon: <BoxIcon />, value: "CONFIRMED" },
      { name: "Ready for Pickup", icon: <RouteIcon />, value: "READY_FOR_PICKUP" },
      { name: "Picked Up", description: `Collected • ${fd(deliverDate)}`, icon: <CheckIcon />, value: "DELIVERED" }
    ];
  } else {
    steps = [
      { name: "Ordered", description: `Order Placed • ${fd(orderDate)}`, icon: <ReceiptIcon />, value: "PLACED" },
      { name: "Packed", icon: <BoxIcon />, value: "CONFIRMED" },
      { name: "Shipped", icon: <TruckIcon />, value: "SHIPPED" },
      { name: "Out for Delivery", icon: <RouteIcon />, value: "ARRIVING" },
      { name: "Delivered", description: `Delivered • ${fd(deliverDate)}`, icon: <CheckIcon />, value: "DELIVERED" }
    ];
  }

  if (!returnRequest && !replacementRequest && orderStatus !== 'CANCELLED') {
    const statuses = steps.map(s => s.value);
    currentIndex = statuses.indexOf(orderStatus);
    if (currentIndex === -1) {
      if (orderStatus === 'PENDING') currentIndex = 0;
      else if (orderStatus === 'DELIVERY') currentIndex = steps.length - 1;
      else currentIndex = 0;
    }
  }

  const fillHeight = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="trackloom-stepper">
      <style>{trackloomStyles}</style>

      <div className="tl-timeline">
        <div className="tl-rail" aria-hidden="true">
          <div className="tl-fill" style={{ height: `${fillHeight}%` }}></div>
        </div>

        {steps.map((step, idx) => {
          const isFinalStatusDone = ['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(currentMainStatus);
          const isDone = idx < currentIndex || (idx === currentIndex && isFinalStatusDone && !step.isCancelled);
          const isActive = idx === currentIndex && !isFinalStatusDone && !step.isCancelled;
          const isCancelled = step.isCancelled;

          let stepClass = 'tl-step';
          if (isDone) stepClass += ' is-done';
          if (isActive) stepClass += ' is-active';
          if (isCancelled) stepClass += ' is-cancelled';

          return (
            <div key={idx} className={stepClass}>
              <div className="tl-pin" aria-hidden="true"></div>
              <div className="tl-body">
                <div className="tl-step-title">
                  <span className="tl-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  {step.name}
                </div>
                <div className="tl-step-sub">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStepper;