import React, { useState, useEffect } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, IconButton } from '@mui/material';
import { handleNameChange, handleNumberChange } from "../../../utils/validationUtils";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { createSeller, sendSellerLoginOtp, resetSellerAuthState } from '../../../redux/Seller/sellerAuthenticationSlice';
import Button from '../../../components/NeonButton';
import TextField from '../../../components/CustomTextField';
import CustomLoader from '../../../components/CustomLoader';
import OTPInput from '../../components/OtpField/OTPInput';

const steps = ['Basic Details', 'Business Info', 'Pickup Address', 'Bank Details', 'Verify'];

const SellerAccountForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dispatch = useAppDispatch();
  const { otpSent, loading, sellerCreated, error } = useAppSelector((state) => state.sellerAuth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetSellerAuthState());
  }, [dispatch]);

  useEffect(() => {
    if (sellerCreated) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    }
  }, [sellerCreated, navigate]);

  const formik = useFormik({
    initialValues: {
      sellerName: '',
      email: '',
      mobile: '',
      GSTIN: '',
      businessDetails: {
        businessName: '',
      },
      pickupAddress: {
        name: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        locality: ''
      },
      bankDetails: {
        accountNumber: '',
        accountHolderName: '',
        ifscCode: ''
      }
    },
    onSubmit: (values) => {
      if (otpSent && otp.length === 6) {
        // Auto-fill address name and mobile since Address model requires them
        const submissionValues = {
          ...values,
          pickupAddress: {
            ...values.pickupAddress,
            name: values.pickupAddress.name || values.sellerName,
            mobile: values.pickupAddress.mobile || values.mobile
          }
        };
        
        dispatch(createSeller({ 
          sellerData: { ...submissionValues, otp },
          navigate 
        }));
      }
    },
  });

  const handleNext = () => {
    if (activeStep === 3) {
      // Send OTP when moving to the final Verify step
      dispatch(sendSellerLoginOtp(formik.values.email));
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Validation checks for each step
  const isStep1Valid = formik.values.sellerName && formik.values.email && formik.values.mobile?.length === 10;
  const isStep2Valid = formik.values.businessDetails.businessName && formik.values.GSTIN;
  const isStep3Valid = formik.values.pickupAddress.address && formik.values.pickupAddress.city && formik.values.pickupAddress.state && formik.values.pickupAddress.pinCode && (!formik.values.pickupAddress.mobile || formik.values.pickupAddress.mobile.length === 10);
  const isStep4Valid = formik.values.bankDetails.accountNumber && formik.values.bankDetails.accountHolderName && formik.values.bankDetails.ifscCode;

  const isCurrentStepValid = () => {
    if (activeStep === 0) return isStep1Valid;
    if (activeStep === 1) return isStep2Valid;
    if (activeStep === 2) return isStep3Valid;
    if (activeStep === 3) return isStep4Valid;
    if (activeStep === 4) return otp.length === 6;
    return false;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 2, sm: 3 }, position: 'relative' }}>
        {activeStep > 0 && !showSuccessMessage && (
          <IconButton 
            onClick={handleBack} 
            sx={{ position: 'absolute', left: { xs: -10, sm: -20 }, top: 0, color: '#64748b' }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{
          width: { xs: 40, sm: 50 },
          height: { xs: 40, sm: 50 },
          borderRadius: '50%',
          bgcolor: '#FF5A00',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '20px', sm: '24px' },
          mb: { xs: 1, sm: 2 },
          boxShadow: '0 4px 14px 0 rgba(255, 90, 0, 0.39)'
        }}>
          S
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Become a Seller
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {steps[activeStep]}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: { xs: 3, sm: 4 }, '& .MuiStepIcon-root.Mui-active': { color: '#FF5A00' }, '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' }, '& .MuiStepIcon-root': { width: { xs: '20px', sm: '24px' }, height: { xs: '20px', sm: '24px' } } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel></StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontSize: '0.875rem' }}>
          {error}
        </Typography>
      )}

      {showSuccessMessage ? (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
          <Typography sx={{ color: '#166534', fontWeight: 600 }}>
            {sellerCreated || 'Seller registered successfully!'}
          </Typography>
          <Typography sx={{ color: '#15803d', fontSize: '0.875rem', mt: 1 }}>
            Redirecting to home...
          </Typography>
        </Box>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* STEP 1: Basic Details */}
            {activeStep === 0 && (
              <>
                <TextField label="Full Name" name="sellerName" value={formik.values.sellerName} onChange={handleNameChange(formik)} fullWidth />
                <TextField label="Email Address" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} fullWidth />
                <TextField label="Mobile Number" name="mobile" value={formik.values.mobile} onChange={handleNumberChange(formik)} fullWidth inputProps={{ maxLength: 10 }} />
              </>
            )}

            {/* STEP 2: Business Info */}
            {activeStep === 1 && (
              <>
                <TextField label="Business Name" name="businessDetails.businessName" value={formik.values.businessDetails.businessName} onChange={formik.handleChange} fullWidth />
                <TextField label="GSTIN Number" name="GSTIN" value={formik.values.GSTIN} onChange={formik.handleChange} fullWidth />
              </>
            )}

            {/* STEP 3: Pickup Address */}
            {activeStep === 2 && (
              <>
                <TextField label="Full Address" name="pickupAddress.address" value={formik.values.pickupAddress.address} onChange={formik.handleChange} fullWidth />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="City" name="pickupAddress.city" value={formik.values.pickupAddress.city} onChange={handleNameChange(formik)} fullWidth />
                  <TextField label="State" name="pickupAddress.state" value={formik.values.pickupAddress.state} onChange={handleNameChange(formik)} fullWidth />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="Pin Code" name="pickupAddress.pinCode" value={formik.values.pickupAddress.pinCode} onChange={handleNumberChange(formik)} fullWidth />
                  <TextField label="Locality" name="pickupAddress.locality" value={formik.values.pickupAddress.locality} onChange={formik.handleChange} fullWidth />
                </Box>
              </>
            )}

            {/* STEP 4: Bank Details */}
            {activeStep === 3 && (
              <>
                <TextField label="Account Holder Name" name="bankDetails.accountHolderName" value={formik.values.bankDetails.accountHolderName} onChange={handleNameChange(formik)} fullWidth />
                <TextField label="Account Number" name="bankDetails.accountNumber" value={formik.values.bankDetails.accountNumber} onChange={handleNumberChange(formik)} fullWidth />
                <TextField label="IFSC Code" name="bankDetails.ifscCode" value={formik.values.bankDetails.ifscCode} onChange={formik.handleChange} fullWidth />
              </>
            )}

            {/* STEP 5: Verification */}
            {activeStep === 4 && (
              <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#475569', mb: 2, textAlign: 'center' }}>
                  We sent a 6-digit code to <br />
                  <strong style={{ color: '#0f172a' }}>{formik.values.email}</strong>
                </Typography>
                <OTPInput length={6} onChange={setOtp} />
              </Box>
            )}

          </Box>

          <Box sx={{ pt: 4 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                disabled={loading || !isCurrentStepValid()}
                onClick={() => formik.handleSubmit()}
                className="w-full text-[14px] px-6 py-[14px] font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                style={{
                  background: '#FF5A00',
                  color: 'white',
                  border: 'none',
                  boxShadow: (loading || !isCurrentStepValid()) ? 'none' : '0 4px 14px 0 rgba(255, 90, 0, 0.39)',
                }}
              >
                {loading ? <CustomLoader color="inherit" size={24} /> : "Create Seller Account"}
              </Button>
            ) : (
              <Button
                disabled={!isCurrentStepValid()}
                onClick={handleNext}
                className="w-full text-[14px] px-6 py-[14px] font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                style={{
                  background: '#0f172a',
                  color: 'white',
                  border: 'none',
                  boxShadow: (!isCurrentStepValid()) ? 'none' : '0 4px 14px 0 rgba(15, 23, 42, 0.39)',
                }}
              >
                Next Step
              </Button>
            )}
          </Box>
        </form>
      )}
    </Box>
  );
};

export default SellerAccountForm;