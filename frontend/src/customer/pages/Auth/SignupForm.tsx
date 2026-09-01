import Button from "../../../components/NeonButton";
import TextField from "../../../components/CustomTextField";
import CustomLoader from "../../../components/CustomLoader";
import { useEffect, useState } from 'react';
import OTPInput from '../../components/OtpField/OTPInput';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { useNavigate } from 'react-router-dom';
import { sendLoginSignupOtp, signup } from '../../../redux/Customer/AuthSlice';
import { useFormik } from 'formik';
import { Alert, Box, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { handleNameChange } from "../../../utils/validationUtils";
const SignupForm = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: ''
    },
    onSubmit: (values) => {
      // Handled via handleSignup
    }
  });

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleResendOTP = () => {
    if (!formik.values.email.trim() || auth.loading) return;
    dispatch(sendLoginSignupOtp({ email: formik.values.email }));
    setTimer(30);
    setIsTimerActive(true);
  };

  const handleSendOtp = () => {
    if (!formik.values.email.trim() || !formik.values.name.trim()) return;
    handleResendOTP();
  };

  const handleSignup = () => {
    if (otp.length !== 6 || auth.loading) return;
    dispatch(signup({
      fullName: formik.values.name,
      email: formik.values.email,
      otp,
      navigate
    }));
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            setIsTimerActive(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#fff0e6', color: '#FF5A00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold', margin: '0 auto', mb: 2 }}>
          S
        </Box>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1f2937' }}>
          Create an Account
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
          Join Near Look to start shopping
        </Typography>
      </Box>
      
      <form className="space-y-4 w-full">
        <TextField
          fullWidth
          name="name"
          label="Full Name"
          placeholder="e.g. John Doe"
          value={formik.values.name}
          onChange={handleNameChange(formik)}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name ? formik.errors.name as string : undefined}
          disabled={auth.otpSent || auth.loading}
        />

        <TextField
          fullWidth
          name="email"
          label="Email Address"
          placeholder="e.g. john@example.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email ? formik.errors.email as string : undefined}
          disabled={auth.otpSent || auth.loading}
        />

        {/* Show OTP only AFTER OTP is successfully sent */}
        {auth.otpSent && (
          <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f9fafb', borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#374151' }}>
              Enter Verification Code
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
              We've sent a 6-digit code to <strong>{formik.values.email}</strong>
            </Typography>
            
            <OTPInput
              length={6}
              onChange={handleOtpChange}
              error={false}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {isTimerActive ? (
                  <span>Resend OTP in <strong style={{ color: '#FF5A00' }}>{timer}s</strong></span>
                ) : (
                  <>
                    Didn’t receive OTP?{" "}
                    <span
                      onClick={handleResendOTP}
                      className="cursor-pointer font-bold text-[#FF5A00] hover:underline"
                    >
                      Resend Code
                    </span>
                  </>
                )}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ pt: 2 }}>
          {auth.otpSent ? (
            <Button
              disabled={auth.loading || otp.length !== 6}
              onClick={handleSignup}
              fullWidth
              variant='contained'
              className="py-3 rounded-xl text-base font-semibold"
              style={{
                boxShadow: (auth.loading || otp.length !== 6) ? 'none' : '0 4px 14px 0 rgba(255, 90, 0, 0.39)'
              }}
            >
              {auth.loading ? <CustomLoader size={24} /> : "Create Account"}
            </Button>
          ) : (
            <Button
              disabled={auth.loading || !formik.values.email.trim() || !formik.values.name.trim()}
              fullWidth
              variant='contained'
              onClick={handleSendOtp}
              className="py-3 rounded-xl text-base font-semibold"
              style={{
                boxShadow: (auth.loading || !formik.values.email.trim() || !formik.values.name.trim()) ? 'none' : '0 4px 14px 0 rgba(255, 90, 0, 0.39)'
              }}
            >
              {auth.loading ? <CustomLoader size={24} /> : "Send OTP"}
            </Button>
          )}
        </Box>
      </form>

      {!auth.otpSent && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const decoded: any = jwtDecode(credentialResponse.credential!);
                formik.setFieldValue('email', decoded.email);
                formik.setFieldValue('name', decoded.name || '');
                dispatch(sendLoginSignupOtp({ email: decoded.email }));
                setTimer(30);
                setIsTimerActive(true);
              }}
              onError={() => {
                console.error('Google Login Failed');
              }}
            />
          </div>
        </div>
      )}
    </Box>
  );
};

export default SignupForm;