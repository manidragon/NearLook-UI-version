// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Payment/PaymentSuccessHandler.tsx
import Button from "../../../components/NeonButton";
import CustomLoader from "../../../components/CustomLoader";
import { Backdrop } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccessHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);

    // ✅ Get params from BOTH query string AND location.state
    const getParam = (key: string): string | null => {
        // Try query string first (URL: ?key=value)
        const params = new URLSearchParams(location.search);
        const queryValue = params.get(key);
        if (queryValue) return queryValue;
        
        // Fallback to location.state (from navigate() state object)
        const state = location.state as Record<string, string> | null;
        return state?.[key] || null;
    };
    
    // ✅ Support multiple parameter name variations for flexibility
    const paymentOrderId = 
        getParam("payment_order_id") || 
        getParam("paymentId") || 
        getParam("orderId") ||
        getParam("paymentLinkId");

    const paymentId = 
        getParam("razorpay_payment_id") || 
        getParam("paymentId");

    useEffect(() => {
        // ✅ NO verification needed here - already done in AddressPage.tsx
        // Just display the success page
        
        console.log("📄 Payment success page loaded:", {
            paymentOrderId,
            paymentId,
            locationState: location.state
        });
        
        // ✅ Just set processing to false - no API call needed
        setProcessing(false);
        
    }, []);  // Empty dependency array - runs once on mount

    // Show loading spinner briefly (for better UX)
    if (processing) {
        return (
            <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
            >
                <CustomLoader color="inherit" size={60} />
            </Backdrop>
        );
    }

    // ✅ Always show success page (verification already done in AddressPage)
    return (
        <div className="min-h-[90vh] flex justify-center items-center px-4 py-10 relative z-10">
            <style>
                {`
                @keyframes successPop {
                    0% { transform: scale(0.8); opacity: 0; }
                    70% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-success-pop {
                    animation: successPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes drawCheck {
                    0% { stroke-dashoffset: 48; }
                    100% { stroke-dashoffset: 0; }
                }
                .animate-draw-check {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: drawCheck 0.6s ease-out 0.3s forwards;
                }
                `}
            </style>
            
            <div className="bg-white text-gray-800 p-8 sm:p-10 w-[95%] max-w-lg border border-gray-100 shadow-2xl rounded-2xl flex flex-col gap-6 items-center justify-center animate-success-pop relative overflow-hidden">
                
                {/* Decorative background circle */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50"></div>

                {/* Success Icon */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center relative shadow-inner mt-4">
                    <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-20"></div>
                    <svg 
                        className="w-14 h-14 text-green-600 relative z-10" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            className="animate-draw-check"
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                        />
                    </svg>
                </div>

                {/* Success Messages */}
                <div className="text-center space-y-2 relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Congratulations!</h1>
                    <h2 className="text-lg sm:text-xl font-medium text-gray-500">Your order was placed successfully.</h2>
                </div>
                
                {paymentOrderId && (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 text-center text-sm text-gray-500 w-full mt-2 relative z-10">
                        <p>Order ID: <span className="font-mono font-bold text-gray-800">{paymentOrderId}</span></p>
                    </div>
                )}
                
                <div className="w-full h-px bg-gray-100 my-2 relative z-10"></div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2 relative z-10">
                    <Button 
                        onClick={() => navigate('/account/orders')} 
                        variant="contained" 
                        color="secondary"
                        fullWidth
                        sx={{ 
                            py: 1.5,
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                            textTransform: 'none',
                            fontSize: '1rem'
                        }}
                    >
                        View Orders
                    </Button>
                    
                    <Button 
                        onClick={() => navigate('/')} 
                        variant="outlined"
                        fullWidth
                        sx={{ 
                            py: 1.5,
                            borderRadius: '10px',
                            color: '#374151', 
                            borderColor: '#D1D5DB',
                            fontWeight: 'medium',
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { 
                                borderColor: '#9CA3AF', 
                                backgroundColor: '#F9FAFB' 
                            } 
                        }}
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessHandler;