import Button from "../../../components/NeonButton";
import TextField from "../../../components/CustomTextField";
import CustomLoader from "../../../components/CustomLoader";;
import { useEffect, useState } from 'react';
import OTPInput from '../../components/OtpField/OTPInput';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { useNavigate } from 'react-router-dom';
import { sendLoginSignupOtp, signin } from '../../../redux/Customer/AuthSlice';
import { useFormik } from 'formik';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import TwitterIcon from '@mui/icons-material/Twitter';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const socialLogins = [
  { title: 'Google', icon: <GoogleIcon />, gradientFrom: '#FF4B2B', gradientTo: '#FF416C' },
  { title: 'Facebook', icon: <FacebookIcon />, gradientFrom: '#00c6ff', gradientTo: '#0072ff' },
  { title: 'Apple', icon: <AppleIcon />, gradientFrom: '#434343', gradientTo: '#000000' },
  { title: 'Twitter', icon: <TwitterIcon />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' }
];

const LoginForm = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    // Optional: add validation later
    onSubmit: (values) => {
      // This won't be used directly; we handle login via handleLogin
    }
  });

  const handleOtpChange = (otpValue: string) => {

    setOtp(otpValue);
  };

  const handleResendOTP = () => {
    if (!formik.values.email || auth.loading) return;
    dispatch(sendLoginSignupOtp({ email: formik.values.email }));
    setTimer(30);
    setIsTimerActive(true);
  };

  const handleSentOtp = () => {
    if (!formik.values.email.trim()) {
      // Optionally show error: "Please enter email"
      return;
    }
    handleResendOTP();
  };

  const handleLogin = () => {
    if (otp.length !== 6 || auth.loading) return;

    dispatch(signin({
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
    <div className="w-full">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center mb-4 bg-primary/10">
          <span className="text-xl font-bold text-primary">N</span>
        </div>
        <h1 className="text-2xl font-bold mb-1 tracking-wide text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to continue to Near Look</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        if (!auth.otpSent) {
          handleSentOtp();
        } else if (otp.length === 6) {
          handleLogin();
        }
      }}>
        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={auth.otpSent || auth.loading}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 placeholder-gray-400 transition-colors font-medium`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-400 text-xs mt-1 ml-1">{formik.errors.email as string}</p>
          )}
        </div>

        {/* OTP Section */}
        {auth.otpSent && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">* Enter OTP sent to your email</p>
              <OTPInput
                length={6}
                onChange={handleOtpChange}
                error={false}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span>Remember me</span>
              </label>
              
              {isTimerActive ? (
                <span className="text-gray-500">Resend in {timer}s</span>
              ) : (
                <span
                  onClick={handleResendOTP}
                  className="text-primary font-semibold cursor-pointer hover:underline transition-colors"
                >
                  Resend OTP?
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4">
          {auth.otpSent ? (
            <button
              type="submit"
              disabled={auth.loading || otp.length !== 6}
              onClick={handleLogin}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {auth.loading ? <CustomLoader size={20} /> : (
                <>Sign In <span className="text-xl leading-none font-normal">→</span></>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={auth.loading || !formik.values.email.trim()}
              onClick={handleSentOtp}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {auth.loading ? <CustomLoader size={20} /> : (
                <>Send OTP <span className="text-xl leading-none font-normal">→</span></>
              )}
            </button>
          )}
        </div>
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



      {/* Footer is now handled by Auth.tsx to toggle forms */}
    </div>
  );
};

export default LoginForm;