import Alert from "../../../components/CustomAlert";
import Button from "../../../components/NeonButton";
import { Snackbar, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import SellerAccountForm from "./SellerAccountForm";
import SellerLoginForm from "./SellerLoginForm";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { resetSellerAuthState } from "../../../redux/Seller/sellerAuthenticationSlice";
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Navbar from "../../components/Navbar/Navbar";
import { GoogleOAuthProvider } from '@react-oauth/google';
const BecomeSeller = () => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);
  const sellerAuth = useAppSelector((state) => state.sellerAuth);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (sellerAuth.otpSent || sellerAuth.error) {
      setSnackbarOpen(true);
    }
  }, [sellerAuth.otpSent, sellerAuth.error]);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Reset state when switching between login/register
  useEffect(() => {
    dispatch(resetSellerAuthState());
  }, [isLoginPage, modalOpen, dispatch]);

  const openLogin = () => {
    setIsLoginPage(true);
    setModalOpen(true);
  };

  const openRegister = () => {
    setIsLoginPage(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <Navbar hideMobileNav={modalOpen} />
      {/* ─── HERO SECTION ─── */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20 px-6 md:px-16 overflow-hidden">
        {/* Abstract Background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#FF5A00] opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-teal-500 opacity-20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Sell Online to <span className="text-[#FF5A00]">Crores of Customers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Join our marketplace revolution. Enjoy the lowest commissions, pan-India delivery reach, and superfast payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={openRegister}
                variant="contained"
                sx={{
                  backgroundColor: '#C43600',
                  color: 'white',
                  fontWeight: 'bold',
                  py: '14px',
                  px: '32px',
                  fontSize: '1.1rem',
                  '&:hover': { backgroundColor: '#9E2A00' }
                }}
              >
                Start Selling
              </Button>
              <Button
                onClick={openLogin}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: '14px',
                  px: '32px',
                  fontSize: '1.1rem',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Login
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-4 sm:p-8 md:p-10 flex justify-center items-center">
            <img
              src="https://res.cloudinary.com/dt6nu9oqs/image/upload/f_auto,q_auto,w_800,c_limit/v1788326805/ChatGPT_Image_Sep_2_2026_10_48_30_AM.png"
              sizes="(max-width: 768px) 100vw, 50vw"
              width="800"
              height="557"
              alt="Become a Seller"
              className="w-full h-auto max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg object-contain drop-shadow-2xl rounded-xl hover:scale-105 transition-transform duration-500 ease-in-out"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* ─── BENEFITS SECTION ─── */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Sell with Us?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">We offer industry-leading features to help you grow your business effortlessly.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />, title: "Secure Payments", desc: "Get payments directly in your bank account fast." },
            { icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, title: "Pan-India Reach", desc: "Deliver to 100% of serviceable pincodes in India." },
            { icon: <StorefrontIcon sx={{ fontSize: 40 }} />, title: "0% Commission", desc: "Enjoy maximum profits with our 0% commission fee." },
            { icon: <SupportAgentIcon sx={{ fontSize: 40 }} />, title: "24x7 Support", desc: "Dedicated seller support to help you at every step." }
          ].map((benefit, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-[#fff3e0] text-[#FF5A00] flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 md:px-16 bg-white w-full border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Start selling online in 4 simple steps.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
            
            {[
              { step: 1, title: "Register", desc: "Create your seller account securely using just your mobile and email." },
              { step: 2, title: "List Products", desc: "Add your products and their pricing on the dashboard." },
              { step: 3, title: "Get Orders", desc: "Receive orders from millions of customers." },
              { step: 4, title: "Get Paid", desc: "Payments are deposited to your bank account." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center max-w-[200px] mb-10 md:mb-0 bg-white px-2">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODAL POPUP FOR FORMS ─── */}
      <GoogleOAuthProvider clientId="903968210580-qe4gosdi9acof4hutt3aeamro1bmj9a5.apps.googleusercontent.com">
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            background: "transparent",
            boxShadow: "none",
            overflow: "visible"
          }
        }}
      >
        <div className='relative max-w-md mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-gray-900'>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'gray',
              zIndex: 10
            }}
          >
            <CloseIcon />
          </IconButton>
          <div className='pt-12 px-5 pb-6 sm:px-10 sm:pb-10'>
            {!isLoginPage ? (
              <SellerAccountForm />
            ) : (
              <SellerLoginForm />
            )}

            <div className='text-center text-sm text-gray-500 mt-8'>
              {isLoginPage ? "Don't have an account?" : "Already have an account?"}
              <span 
                onClick={() => setIsLoginPage(!isLoginPage)} 
                className='text-[#FF5A00] font-bold cursor-pointer hover:underline ml-1'
              >
                {isLoginPage ? "Register" : "Login"}
              </span>
            </div>
          </div>
        </div>
      </Dialog>
      </GoogleOAuthProvider>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={
            sellerAuth.error 
              ? sellerAuth.error.toLowerCase().includes("pending") 
                ? "warning" 
                : "error" 
              : "success"
          }
          variant="filled"
          sx={{ width: '100%' }}
        >
          {sellerAuth.error || "OTP sent successfully!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BecomeSeller;