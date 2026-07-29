// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Checkout\AddressPage.tsx
import React, { useState, useEffect } from 'react';
import PricingCard from '../Cart/PricingCard';
import { Box, Button, FormControlLabel, Modal, Radio, RadioGroup, Alert, Snackbar, Typography } from '@mui/material';
import AddressForm from './AddresssForm';
import AddressCard from './AddressCard';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { selectCart } from '../../../redux/Customer/CartSlice';
import { createOrder } from '../../../redux/Customer/OrderSlice';
import { calculateTotalDeliveryCharges } from '../../../util/cartCalculator';
import { selectLocationFilter } from '../../../redux/Customer/ProductSlice';
import { clearCartAfterOrder } from '../../../redux/Customer/CartSlice';
import { useNavigate } from 'react-router-dom';
import type { Address } from '../../../types/addressTypes';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import CustomLoader from "../../../components/CustomLoader";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

// ✅ NEW: Load Razorpay Script Dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// ✅ Note: This is now a function that uses walletBalance
const getPaymentGatewayList = (finalAmount: number, walletBalance: number) => [
    {
        value: "RAZORPAY",
        image: "https://razorpay.com/newsroom-content/uploads/2020/12/output-onlinepngtools-1-1.png",
        label: "Razorpay",
        icon: null,
        disabled: false
    },
    {
        value: "CASH_ON_DELIVERY",
        image: "",
        label: "Cash on Delivery",
        icon: <CurrencyRupeeIcon />,
        disabled: false
    },
    {
        value: "WALLET",
        image: "",
        label: `Pay with Wallet (Balance: ₹${walletBalance})`,
        icon: <AccountBalanceWalletIcon sx={{ color: walletBalance >= finalAmount ? 'green' : 'red' }} />,
        disabled: walletBalance < finalAmount,
        balanceInfo: walletBalance < finalAmount 
            ? `Insufficient balance (Need ₹${finalAmount - walletBalance} more)` 
            : null
    }
];

const fulfillmentOptions = [
    { value: 'DELIVERY', label: 'Home Delivery', icon: <LocalShippingIcon /> },
    { value: 'SELF_PICKUP', label: 'Self Pickup', icon: <StorefrontIcon /> }
];

const AddressPage = () => {
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'SELF_PICKUP'>('DELIVERY');
    const [selectedPickupTime, setSelectedPickupTime] = useState<Dayjs | null>(null);
    const [pickupTimeError, setPickupTimeError] = useState<string>('');

    // ✅ NEW: State for Razorpay modal
    const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null);
    const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);
    const cart = useAppSelector(selectCart);
    const locationFilter = useAppSelector(selectLocationFilter);
    const [paymentGateway, setPaymentGateway] = useState("RAZORPAY"); 
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);
const [, setWalletLoading] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user.user?.addresses && user.user.addresses.length > 0) {
            setSelectedAddressId(user.user.addresses[0]._id);
        }
    }, [user.user?.addresses]);

    // ✅ NEW: Fetch wallet balance when component mounts
useEffect(() => {
    const fetchWalletBalance = async () => {
        try {
            setWalletLoading(true);
            const jwt = localStorage.getItem('jwt') || '';
            const response = await axios.get('http://localhost:8080/api/wallet', {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            // ✅ Handle different response structures
            const balance = response.data.balance || response.data.wallet?.balance || 0;
            setWalletBalance(balance);
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
            setWalletBalance(0);
        } finally {
            setWalletLoading(false);
        }
    };
    
    fetchWalletBalance();
}, []);

    // ✅ NEW: useEffect to trigger Razorpay modal when data is ready
    useEffect(() => {
        if (razorpayOrderData && typeof window !== 'undefined') {
            loadRazorpayScript().then((res) => {
                if (res) {
                    openRazorpayModal(razorpayOrderData, paymentOrderId!);
                } else {
                    console.error("Failed to load Razorpay SDK");
                    setSnackbarMessage("Failed to load payment gateway");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                }
            });
        }
    }, [razorpayOrderData, paymentOrderId]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddressChange = (addressId: string) => {
        setSelectedAddressId(addressId);
    };

    const handleFulfillmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = (event.target as HTMLInputElement).value as 'DELIVERY' | 'SELF_PICKUP';
        setFulfillmentType(selectedValue);

        if (selectedValue === 'SELF_PICKUP') {
            setSelectedAddressId(null);
            setSelectedPickupTime(null);
        } else if (user.user?.addresses && user.user.addresses.length > 0) {
            setSelectedAddressId(user.user.addresses[0]._id);
        }
    };

    // ✅ NEW: Razorpay Modal Function
    const openRazorpayModal = (orderData: any, paymentOrderId: string) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SmO760j2VBTxSH',
            amount: orderData.amount,
            currency: orderData.currency,
            name: "MANIVASAGAN",
            description: "Order Payment",
            order_id: orderData.order_id,

            handler: async function (response: any) {

                try {
                    // ✅ Notify backend to verify payment & create actual orders
                    const verifyResp = await axios.get(
                        `http://localhost:8080/api/payment/${response.razorpay_payment_id}?paymentLinkId=${paymentOrderId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('jwt')}`
                            }
                        }
                    );


                  // ✅ Clear cart via Redux
dispatch(clearCartAfterOrder());

// ✅ Show success modal instead of navigating
setSuccessOrderId(paymentOrderId);
setShowSuccessModal(true);

// ✅ ALSO reset modal state
setRazorpayOrderData(null);
setPaymentOrderId(null);

                } catch (err: any) {
                    console.error("❌ Payment verification failed:", err);
                    setSnackbarMessage('Payment succeeded but order creation failed. Please contact support.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                } finally {
                    setRazorpayOrderData(null);
                    setPaymentOrderId(null);
                }
            },

            prefill: {
                name: orderData.customer.name,
                email: orderData.customer.email,
                contact: orderData.customer.contact
            },

            theme: {
                color: "#3399cc"
            },

            modal: {
                ondismiss: function () {
                    setRazorpayOrderData(null);
                    setPaymentOrderId(null);
                }
            }
        };

        // ✅ Open desktop modal
        const rzp = new (window as any).Razorpay(options);

        // Handle payment errors
        rzp.on('payment.failed', function (response: any) {
            console.error("❌ Payment failed:", response.error);
            setSnackbarMessage(response.error.description || 'Payment failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setRazorpayOrderData(null);
            setPaymentOrderId(null);
        });

        rzp.open();
    };

    const handleCreateOrder = async () => {
        if (!cart || cart.cartItems.length === 0) {
            setSnackbarMessage('Your cart is empty');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // ✅ Validate pickup time for self-pickup orders
        if (fulfillmentType === 'SELF_PICKUP') {
            if (!selectedPickupTime) {
                setSnackbarMessage('Please select a pickup time');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }

            if (selectedPickupTime.isBefore(dayjs())) {
                setSnackbarMessage('Pickup time must be in the future');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        }

        if (fulfillmentType === 'DELIVERY' && !selectedAddressId) {
            setSnackbarMessage('Please select a delivery address');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        let selectedAddress: Address | undefined = undefined;
        if (fulfillmentType === 'DELIVERY' && selectedAddressId) {
            selectedAddress = user.user?.addresses?.find(a => a._id === selectedAddressId);
            if (!selectedAddress) {
                setSnackbarMessage('Selected address not found');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        }

        setCheckoutLoading(true);

        try {
            const subtotal = cart.totalSellingPrice;
            const shippingCost = calculateTotalDeliveryCharges(cart?.cartItems || [], locationFilter);
            const platformFee = 7;
            const discount = cart.couponPrice || 0;

            const finalAmount = subtotal + shippingCost + platformFee - discount;

            console.log("  - Shipping:", shippingCost);  // Will show 0

            const result: any = await dispatch(createOrder({
                address: selectedAddress,
                fulfillmentType,
                pickupTime: selectedPickupTime ? selectedPickupTime.toISOString() : undefined,
                jwt: localStorage.getItem('jwt') || "",
                paymentGateway,
                finalAmount
            })).unwrap();

            // ✅ Type Guard 1: Check for Razorpay Order (NEW)
            if (result && result.type === 'RAZORPAY_ORDER' && result.razorpayOrder) {

                // ✅ Store data to trigger modal via useEffect
                setRazorpayOrderData(result.razorpayOrder);
                setPaymentOrderId(result.paymentOrderId);

                // ✅ Modal will open automatically via useEffect
                return;
            }

            // ✅ Type Guard 2: Check for Payment Link (OLD fallback)
            if (result && typeof result === 'object' && 'payment_link_url' in result && result.payment_link_url) {
                window.location.href = result.payment_link_url;
                return;
            }

          // ✅ Type Guard 3: Check for COD or WALLET success
if (result && typeof result === 'object' && 'success' in result && result.success && 'orders' in result && result.orders) {
    // Clear cart via Redux
    dispatch(clearCartAfterOrder());
    
    // ✅ Show success message for wallet payment
    if (result.paymentMethod === 'WALLET') {
        setSnackbarMessage(`✅ Order placed successfully! ₹${result.totalAmount} deducted from your wallet.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    }
    
    setSuccessOrderId(result.orders?.[0]?._id || "Placed successfully");
    setShowSuccessModal(true);
    return;
}

// ✅ NEW Type Guard 4: Handle insufficient wallet balance
if (result && typeof result === 'object' && 'success' in result && !result.success && 'currentBalance' in result) {
    setSnackbarMessage(`❌ ${result.message}`);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
}

            // Default fallback
            setSuccessOrderId(null);
            setShowSuccessModal(true);

        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Failed to create order');
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = (event.target as HTMLInputElement).value;
        setPaymentGateway(selectedValue);
    };

    const handleFormSuccess = () => {
        setSnackbarMessage('Address added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        setTimeout(() => {
            if (user.user?.addresses && user.user.addresses.length > 0) {
                setSelectedAddressId(user.user.addresses[user.user.addresses.length - 1]._id);
            }
        }, 500);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className='pt-4 md:pt-10 px-3 sm:px-10 lg:px-20 xl:px-40 min-h-screen bg-gray-50 pb-20'>
                <div className='space-y-6 lg:space-y-0 lg:grid grid-cols-3 lg:gap-10'>
                    <div className="col-span-2 space-y-6">
                        {fulfillmentType === 'DELIVERY' ? (
                            <>
                                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2'>
                                    <span className='font-bold text-xl text-gray-800 tracking-tight'>Select Delivery Address</span>
                                    <Button
                                        onClick={handleOpen}
                                        variant='contained'
                                        startIcon={<AddIcon />}
                                        sx={{ bgcolor: '#FF5A00', '&:hover': {bgcolor: '#E64D00'}, borderRadius: 2, py: 1.2, px: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: '0 4px 12px rgba(255,90,0,0.2)' }}
                                    >
                                        Add New Address
                                    </Button>
                                </div>

                                {user.user?.addresses && user.user.addresses.length > 0 ? (
                                    <div className='space-y-4'>
                                        {user.user.addresses.map((item: Address) => (
                                            <AddressCard
                                                key={item._id}
                                                item={item}
                                                selectedAddressId={selectedAddressId}
                                                onAddressSelect={handleAddressChange}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Alert severity="info" className='mt-4'>
                                        No saved addresses. Please add a new address to proceed.
                                    </Alert>
                                )}
                            </>
                        ) : (
                            <div className='p-4 bg-white/95 shadow-sm rounded-md border border-blue-200'>
                                <div className='flex items-start gap-3'>
                                    <StorefrontIcon sx={{ color: 'blue', mt: 0.5 }} />
                                    <div>
                                        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                                            Self Pickup from Store
                                        </Typography>
                                        
                                        {(() => {
                                            // Find the first cart item that has a pickup address
                                            const itemWithPickup = cart?.cartItems?.find(item => 
                                                (item.sellerId as any)?.pickupAddress || (item.product?.seller as any)?.pickupAddress || (item.sellerId as any)?.businessDetails?.businessAddress || (item.product?.seller as any)?.businessDetails?.businessAddress
                                            );
                                            
                                            const seller = (itemWithPickup?.sellerId as any) || (itemWithPickup?.product?.seller as any) || (cart?.cartItems?.[0]?.sellerId as any) || (cart?.cartItems?.[0]?.product?.seller as any);
                                            const pickupAddress = seller?.pickupAddress;
                                            const fallbackAddress = seller?.businessDetails?.businessAddress;
                                            const sellerName = seller?.businessDetails?.businessName || seller?.sellerName || "Seller's";
                                            
                                            console.log("DEBUG CHECKOUT ADDRESS:", {
                                                cartItems: cart?.cartItems,
                                                seller,
                                                pickupAddress,
                                                fallbackAddress,
                                                sellerName,
                                                itemWithPickup
                                            });
                                            
                                            if (pickupAddress) {
                                                return (
                                                    <Box sx={{ mt: 1, p: 2, bgcolor: 'blue.50', borderRadius: 1, border: '1px solid', borderColor: 'blue.100' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                                                            Pickup Address ({sellerName}):
                                                        </Typography>
                                                        <Typography variant="body2">{pickupAddress.address}</Typography>
                                                        <Typography variant="body2">{pickupAddress.city}, {pickupAddress.state}</Typography>
                                                        <Typography variant="body2">{pickupAddress.pinCode}</Typography>
                                                    </Box>
                                                );
                                            } else if (fallbackAddress) {
                                                return (
                                                    <Box sx={{ mt: 1, p: 2, bgcolor: 'blue.50', borderRadius: 1, border: '1px solid', borderColor: 'blue.100' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                                                            Pickup Address ({sellerName}):
                                                        </Typography>
                                                        <Typography variant="body2">{fallbackAddress}</Typography>
                                                    </Box>
                                                );
                                            }
                                            
                                            return (
                                                <Typography variant="body2" color="text.secondary">
                                                    You'll pick up your order directly from the {sellerName} store.
                                                    The pickup address will be shown in your order details.
                                                </Typography>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-span-1 text-sm space-y-3">
                        <section className='space-y-3 border p-5 rounded-md bg-white/95 shadow-sm'>
                            <h1 className='text-primary-color font-medium pb-2 text-center'>
                                Choose Fulfillment Type
                            </h1>

                            <RadioGroup
                                aria-labelledby="fulfillment-type-group"
                                name="fulfillment-type"
                                className='flex flex-col gap-3'
                                onChange={handleFulfillmentChange}
                                value={fulfillmentType}
                            >
                                {fulfillmentOptions.map((item) => (
                                    <FormControlLabel
                                        key={item.value}
                                        value={item.value}
                                        control={<Radio />}
                                        sx={{ margin: 0 }}
                                        label={
                                            <div className='flex items-center gap-3'>
                                                <span className='text-primary-color'>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </div>
                                        }
                                        className={`border rounded-md p-2 w-full ${fulfillmentType === item.value
                                            ? "border-primary-color bg-primary-color/10"
                                            : ""
                                            }`}
                                    />
                                ))}
                            </RadioGroup>
                        </section>

                        {fulfillmentType === 'SELF_PICKUP' && (
                            <section className='space-y-3 border p-5 rounded-md bg-white/95 shadow-sm'>
                                <h1 className='text-primary-color font-medium pb-2 text-center'>
                                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Schedule Pickup Time
                                </h1>
                                <DateTimePicker
                                    label="Select Pickup Date & Time"
                                    value={selectedPickupTime}
                                    onChange={(newValue) => {
                                        setSelectedPickupTime(newValue);
                                        setPickupTimeError('');
                                    }}
                                    minDateTime={dayjs().add(1, 'hour')}
                                    disablePast
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!pickupTimeError,
                                            helperText: pickupTimeError || 'Minimum 1 hour from now',
                                            margin: 'normal',
                                            size: 'small'
                                        }
                                    }}
                                />
                                <Typography variant='body2' color='text.secondary' className='text-center text-xs'>
                                    Please arrive at the store at your scheduled time
                                </Typography>
                            </section>
                        )}

                        <section className='space-y-3 border p-5 rounded-md bg-white/95 shadow-sm'>
                            <h1 className='text-primary-color font-medium pb-2 text-center'>
                                Choose Payment Method
                            </h1>

                           {/* ✅ Calculate final amount for wallet validation */}
{(() => {
    const subtotal = cart?.totalSellingPrice || 0;
    const platformFee = 7;
    const discount = cart?.couponPrice || 0;
    const finalAmount = subtotal + platformFee - discount;
    const paymentOptions = getPaymentGatewayList(finalAmount, walletBalance);
    
    return (
        <RadioGroup
            aria-labelledby="payment-gateway-group"
            name="payment-gateway"
            className='flex flex-col gap-3'
            onChange={handlePaymentChange}
            value={paymentGateway}
        >
            {paymentOptions.map((item) => (
                <FormControlLabel
                    key={item.value}
                    value={item.value}
                    control={<Radio disabled={item.disabled} />}
                    disabled={item.disabled}
                    sx={{ margin: 0 }}
                    label={
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-3'>
                                {item.image ? (
                                    <img
                                        className='h-8 object-contain'
                                        src={item.image}
                                        alt={item.label}
                                    />
                                ) : item.icon ? (
                                    <span className='text-primary-color'>{item.icon}</span>
                                ) : null}
                                {item.value !== 'RAZORPAY' && <span>{item.label}</span>}
                            </div>
                            {item.balanceInfo && (
                                <Typography 
                                    variant="caption" 
                                    color="error" 
                                    sx={{ ml: 4, mt: 0.5 }}
                                >
                                    ⚠️ {item.balanceInfo}
                                </Typography>
                            )}
                        </div>
                    }
                    className={`border rounded-md p-2 w-full ${
                        item.disabled 
                            ? "border-gray-300 bg-gray-50 opacity-60" 
                            : paymentGateway === item.value
                                ? "border-primary-color bg-primary-color/10"
                                : ""
                    }`}
                />
            ))}
        </RadioGroup>
    );
})()}
                        </section>

                        <section className='border rounded-md bg-white/95 shadow-sm overflow-hidden'>
                            <PricingCard />
                            <div className='p-5 border-t border-gray-100'>
                                <Button
                                    onClick={handleCreateOrder}
                                    sx={{ py: "14px" }}
                                    variant='contained'
                                    fullWidth
                                    disabled={
                                        checkoutLoading ||
                                        (fulfillmentType === 'DELIVERY' && !selectedAddressId) ||
                                        (fulfillmentType === 'SELF_PICKUP' && !selectedPickupTime)
                                    }
                                >
                                    {checkoutLoading ? (
                                        <CustomLoader size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        'Proceed to Checkout'
                                    )}
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>

                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <AddressForm
                            handleClose={handleClose}
                            onSuccess={handleFormSuccess}
                        />
                    </Box>
                </Modal>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                {/* SUCCESS MODAL */}
                <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} className="flex justify-center items-center">
                    <div className="bg-white text-gray-800 p-8 sm:p-10 w-[95%] max-w-md border border-gray-100 shadow-2xl rounded-2xl flex flex-col gap-6 items-center justify-center animate-success-pop relative overflow-hidden outline-none">
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

                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50"></div>

                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center relative shadow-inner mt-4">
                            <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-20"></div>
                            <svg className="w-14 h-14 text-green-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path className="animate-draw-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div className="text-center space-y-2 relative z-10">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Congratulations!</h1>
                            <h2 className="text-lg sm:text-xl font-medium text-gray-500">Your order was placed successfully.</h2>
                        </div>
                        
                        {successOrderId && (
                            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 text-center text-sm text-gray-500 w-full mt-2 relative z-10">
                                <p>Order ID: <span className="font-mono font-bold text-gray-800">{successOrderId}</span></p>
                            </div>
                        )}
                        
                        <div className="w-full h-px bg-gray-100 my-2 relative z-10"></div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2 relative z-10">
                            <button 
                                onClick={() => navigate('/account/orders')} 
                                className="w-full py-3 rounded-xl font-bold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-colors"
                            >
                                View Orders
                            </button>
                            
                            <button 
                                onClick={() => navigate('/')} 
                                className="w-full py-3 rounded-xl font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </LocalizationProvider>
    );
};

export default AddressPage;