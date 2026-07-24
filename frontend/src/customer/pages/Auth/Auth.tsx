import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import Alert from "../../../components/CustomAlert";
import Button from "../../../components/NeonButton";
import { Snackbar, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SignupForm from './SignupForm';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { resetAuth } from '../../../redux/Customer/AuthSlice';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, fetchUserAddresses } from '../../../redux/Customer/UserSlice';
import { fetchUserCart } from '../../../redux/Customer/CartSlice';
import { getWishlistByUserId } from '../../../redux/Customer/WishlistSlice';

interface AuthProps {
  open: boolean;
  handleClose: () => void;
}

const Auth = ({ open, handleClose }: AuthProps) => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(state => state.auth);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Handle snackbar open on otpSent or error
  useEffect(() => {
    if (auth.otpSent || auth.error) {
      setSnackbarOpen(true);

    }
  }, [auth.otpSent, auth.error]);

  // Handle successful login/signup to close modal
  useEffect(() => {
    if (auth.jwt && open) {
      handleCloseModal();
      // Fetch user profile and related data immediately after login
      if (auth.role === "ROLE_CUSTOMER" || !auth.role) {
        dispatch(fetchUserProfile({ jwt: auth.jwt, navigate }));
        dispatch(fetchUserCart(auth.jwt));
        dispatch(getWishlistByUserId(auth.jwt));
        dispatch(fetchUserAddresses());
      }
    }
  }, [auth.jwt]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseModal = () => {
    dispatch(resetAuth());
    setIsLoginPage(true);
    setSnackbarOpen(false);
    handleClose();
  };

  const toggleAuthMode = () => {
    // Reset auth state to clear otpSent, error, loading
    dispatch(resetAuth());
    // Close snackbar immediately
    setSnackbarOpen(false);
    // Toggle view
    setIsLoginPage(!isLoginPage);
  };

  return (
    <Dialog 
      open={open} 
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
        <div className='pt-10 sm:pt-14 px-6 sm:px-10 pb-8 sm:pb-10'>
          {isLoginPage ? <LoginForm /> : <SignupForm />}

          <div className='text-center text-sm text-gray-500 mt-8'>
            {isLoginPage ? "Don't have an account?" : "Already have an account?"}
            <span 
              onClick={toggleAuthMode} 
              className='text-primary font-bold cursor-pointer hover:underline ml-1'
            >
              {isLoginPage ? "Sign up" : "Login"}
            </span>
          </div>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={auth.error ? "error" : "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {auth.error || "OTP sent to your email!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default Auth;