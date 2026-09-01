import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../../redux/Store";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Modal,
  Snackbar,
  Typography,
  Tabs,
  Tab,
  Paper
} from "@mui/material";
import ProfileFildCard from "./ProfileFildCard";
import EditIcon from "@mui/icons-material/Edit";
import PersonalDetailsForm from "./PersionalDetailsForm";
import BusinessDetailsForm from "./BussinessDetailsForm";
import PickupAddressForm from "./PickupAddressForm";
import BankDetailsForm from "./BankDetailsForm";
import LogoUploadForm from "./LogoUploadForm";
import LocationForm from "./LocationForm";
import OperationsForm from "./OperationsForm";
import StorefrontForm from "./StorefrontForm";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LanguageIcon from '@mui/icons-material/Language';
import BannerUploadForm from './BannerUploadForm';

export const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', sm: 500 },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Profile = () => {
  const sellers = useAppSelector((state) => state.sellers);
  const [open, setOpen] = React.useState(false);
  const [selectedForm, setSelectedForm] = useState("personalDetails");
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setOpenSnackbar] = useState(false);

  const handleClose = () => setOpen(false);

  const handleOpen = (formName: string) => {
    setOpen(true);
    setSelectedForm(formName);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderSelectedForm = () => {
    switch (selectedForm) {
      case "personalDetails": return <PersonalDetailsForm onClose={handleClose} />;
      case "businessDetails": return <BusinessDetailsForm onClose={handleClose} />;
      case "pickupAddress": return <PickupAddressForm onClose={handleClose} />;
      case "bankDetails": return <BankDetailsForm onClose={handleClose} />;
      case "logo": return <LogoUploadForm onClose={handleClose} />;
      case "location": return <LocationForm onClose={handleClose} />;
      case "operations": return <OperationsForm onClose={handleClose} />;
      case "storefront": return <StorefrontForm onClose={handleClose} />;
      case "banner": return <BannerUploadForm onClose={handleClose} />;
      default: return null;
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    if (sellers.profileUpdated || sellers.error) {
      setOpenSnackbar(true);
    }
  }, [sellers.profileUpdated, sellers.error]);

  const getAddressField = (field: string) => {
    const addr = sellers.profile?.pickupAddress;
    if (!addr) return "Not provided";
    if (typeof addr === 'string') return "Loading...";
    return addr[field as keyof typeof addr] || "Not provided";
  };

  const getLocationDisplay = () => {
    const loc = sellers.profile?.location;
    if (!loc?.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length < 2) return "Not set";
    return `${loc.coordinates[1]?.toFixed(4)}, ${loc.coordinates[0]?.toFixed(4)}`;
  };

  return (
    <div className="lg:px-8 xl:px-20 pt-4 sm:pt-8 pb-20 max-w-7xl mx-auto px-2 sm:px-6">
      {/* Modern Profile Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-500 to-orange-400 p-6 sm:p-8 mb-6 sm:mb-10 shadow-lg shadow-orange-500/30 flex items-center gap-4 sm:gap-6 text-white transition-transform hover:scale-[1.01] duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <Avatar 
          alt="Seller Profile Logo"
          src={sellers.profile?.businessDetails?.logo} 
          sx={{ width: { xs: 70, sm: 90 }, height: { xs: 70, sm: 90 }, border: '4px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} 
        />
        <div className="relative z-10 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm truncate max-w-full">{sellers.profile?.sellerName || 'Seller Profile'}</h1>
          <p className="text-orange-50 mt-1 font-medium text-sm sm:text-base flex items-center gap-1 w-full">
            <span className="opacity-90 truncate max-w-full block">{sellers.profile?.email}</span>
          </p>
        </div>
      </div>

      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'grey.100', px: { xs: 1, sm: 3 }, pt: 2, bgcolor: 'white' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto" 
            aria-label="seller profile tabs"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#FF5A00', height: 4, borderRadius: '4px 4px 0 0' },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' }, color: 'text.secondary', minHeight: { xs: 48, sm: 60 }, transition: 'all 0.2s', '&:hover': { color: '#b33f00', opacity: 0.8 }, '&.Mui-selected': { color: '#b33f00' } }
            }}
          >
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Profile" {...a11yProps(0)} />
            <Tab icon={<BusinessCenterIcon />} iconPosition="start" label="Business" {...a11yProps(1)} />
            <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Banking" {...a11yProps(2)} />
            <Tab icon={<LocalShippingIcon />} iconPosition="start" label="Operations" {...a11yProps(3)} />
            <Tab icon={<StorefrontIcon />} iconPosition="start" label="Storefront" {...a11yProps(4)} />
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Metrics" {...a11yProps(5)} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 }, bgcolor: '#fafbfd' }}>
          {/* TAB 0: PROFILE & SECURITY */}
          <CustomTabPanel value={tabValue} index={0}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Personal Details</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("personalDetails")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"Seller Name"} value={sellers.profile?.sellerName || "Not provided"} />
                <ProfileFildCard keys={"Email"} value={sellers.profile?.email || "Not provided"} />
                <ProfileFildCard keys={"Mobile"} value={sellers.profile?.mobile || "Not provided"} />
              </Paper>
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Business Logo</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("logo")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <div className="flex justify-center items-center p-4 bg-slate-50 rounded-md">
                  {sellers.profile?.businessDetails?.logo ? (
                    <img src={sellers.profile.businessDetails.logo} alt="Logo" className="max-w-[150px] max-h-[150px] object-contain" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No logo uploaded</Typography>
                  )}
                </div>
              </Paper>
            </div>
          </CustomTabPanel>

          {/* TAB 1: BUSINESS & TAX */}
          <CustomTabPanel value={tabValue} index={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Business Identity</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("businessDetails")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"Business Name"} value={sellers.profile?.businessDetails?.businessName || "Not provided"} />
                <ProfileFildCard keys={"Business Email"} value={sellers.profile?.businessDetails?.businessEmail || "Not provided"} />
                <ProfileFildCard keys={"Business Mobile"} value={sellers.profile?.businessDetails?.businessMobile || "Not provided"} />
                <ProfileFildCard keys={"GSTIN"} value={sellers.profile?.GSTIN || "Not provided"} />
                <ProfileFildCard keys={"PAN Number"} value={sellers.profile?.PAN || "Not provided"} />
                <ProfileFildCard keys={"Business Type"} value={sellers.profile?.businessType || "Not specified"} />
              </Paper>
              
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Store Location</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("location")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"District"} value={sellers.profile?.district || "Not provided"} />
                <ProfileFildCard keys={"Coordinates"} value={getLocationDisplay()} />
                <ProfileFildCard keys={"Address"} value={sellers.profile?.location?.address || "Not provided"} />
              </Paper>
            </div>
          </CustomTabPanel>

          {/* TAB 2: BANKING & PAYOUTS */}
          <CustomTabPanel value={tabValue} index={2}>
             <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' }, maxWidth: '800px' }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Bank Details</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("bankDetails")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"Account Holder"} value={sellers.profile?.bankDetails?.accountHolderName || "Not provided"} />
                <ProfileFildCard keys={"Account Number"} value={sellers.profile?.bankDetails?.accountNumber || "Not provided"} />
                <ProfileFildCard keys={"IFSC Code"} value={sellers.profile?.bankDetails?.ifscCode || "Not provided"} />
                <ProfileFildCard keys={"UPI ID"} value={sellers.profile?.bankDetails?.upiId || "Not provided"} />
             </Paper>
          </CustomTabPanel>

          {/* TAB 3: OPERATIONS */}
          <CustomTabPanel value={tabValue} index={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Fulfillment Settings</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("operations")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"Fulfillment Mode"} value={sellers.profile?.fulfillmentMode || "SELF_SHIP"} />
                <ProfileFildCard keys={"Handling Time"} value={`${sellers.profile?.handlingTime || 2} Days`} />
                <ProfileFildCard keys={"Min Free Delivery (₹)"} value={`₹${sellers.profile?.minFreeDelivery ?? 500}`} />
              </Paper>
              
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Pickup Address</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("pickupAddress")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                <ProfileFildCard keys={"Contact Name"} value={getAddressField("name")} />
                <ProfileFildCard keys={"Mobile"} value={getAddressField("mobile")} />
                <ProfileFildCard keys={"Address"} value={getAddressField("address")} />
                <ProfileFildCard keys={"Locality"} value={getAddressField("locality")} />
                <ProfileFildCard keys={"City & State"} value={`${getAddressField("city")}, ${getAddressField("state")}`} />
                <ProfileFildCard keys={"Pin Code"} value={getAddressField("pinCode")} />
              </Paper>
            </div>
          </CustomTabPanel>

          {/* TAB 4: STOREFRONT */}
          <CustomTabPanel value={tabValue} index={4}>
            <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' }, maxWidth: '800px' }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Storefront Branding</h2>
                  <Button aria-label="Edit" onClick={() => handleOpen("storefront")} size="small" variant="contained" sx={{ minWidth: 0, p: 1, borderRadius: '50%', bgcolor: '#FF5A00', '&:hover': { bgcolor: '#e04f00' }, boxShadow: '0 4px 10px rgba(255,90,0,0.3)' }}><EditIcon fontSize="small" /></Button>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-semibold w-20 lg:w-36 pr-5">Store Banner</p>
                  <Button onClick={() => handleOpen("banner")} size="small" variant="outlined" sx={{ textTransform: "none" }}>Update Banner</Button>
                </div>
                <div className="flex justify-center items-center p-4 bg-slate-50 rounded-md mb-4 border">
                  {sellers.profile?.businessDetails?.banner ? (
                    <img src={sellers.profile.businessDetails.banner} alt="Banner" className="w-full h-32 object-cover rounded" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No banner uploaded</Typography>
                  )}
                </div>

                
                <div className="p-3 sm:p-4 my-2 flex flex-col xl:flex-row xl:items-center bg-[#f8fafc] border border-slate-100 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium xl:w-36 mb-1 xl:mb-0 xl:pr-4 uppercase tracking-wider">Store Desc</p>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base flex-1 break-words break-all mt-1 xl:mt-0">{sellers.profile?.storefront?.description || "Not provided"}</p>
                </div>

                <div className="p-3 sm:p-4 my-2 flex flex-col xl:flex-row xl:items-start bg-[#f8fafc] border border-slate-100 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium xl:w-36 mb-1 xl:mb-0 xl:pr-4 uppercase tracking-wider">Promotions</p>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base flex-1 break-words break-all mt-1 xl:mt-0">
                    {sellers.profile?.storefront?.promotions && sellers.profile.storefront.promotions.length > 0 ? (
                      <ul className="list-disc pl-5 m-0">
                        {sellers.profile.storefront.promotions.map((promo: string, index: number) => (
                          <li key={index}>{promo}</li>
                        ))}
                      </ul>
                    ) : (
                      "No promotions added"
                    )}
                  </div>
                </div>
                
                <ProfileFildCard keys={"Social Links"} value={
                  <div className="flex gap-4">
                    {sellers.profile?.storefront?.socialLinks?.facebook && <a href={sellers.profile.storefront.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:scale-110 transition-transform"><FacebookIcon /></a>}
                    {sellers.profile?.storefront?.socialLinks?.instagram && <a href={sellers.profile.storefront.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:scale-110 transition-transform"><InstagramIcon /></a>}
                    {sellers.profile?.storefront?.socialLinks?.twitter && <a href={sellers.profile.storefront.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-blue-400 hover:scale-110 transition-transform"><TwitterIcon /></a>}
                    {sellers.profile?.storefront?.socialLinks?.website && <a href={sellers.profile.storefront.socialLinks.website} target="_blank" rel="noreferrer" className="text-gray-700 hover:scale-110 transition-transform"><LanguageIcon /></a>}
                    {!sellers.profile?.storefront?.socialLinks && "None configured"}
                  </div>
                } />
            </Paper>
          </CustomTabPanel>

          {/* TAB 5: METRICS (Read-Only) */}
          <CustomTabPanel value={tabValue} index={5}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, xl: 3 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>Total Reviews</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: '900' }}>{sellers.profile?.totalReviews || 0}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, xl: 3 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>Average Rating</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: '900', color: '#FF5A00' }}>{sellers.profile?.averageRating || 0} ⭐</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, xl: 3 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>Cancellation Rate</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: '900', color: '#ef4444' }}>{sellers.profile?.performanceMetrics?.cancellationRate || 0}%</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, xl: 3 }, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>SLA Compliance</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: '900', color: '#10b981' }}>{sellers.profile?.performanceMetrics?.dispatchSlaCompliance || 100}%</Typography>
              </Paper>
            </div>
          </CustomTabPanel>
        </Box>
      </Box>

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title">
        <Box sx={style}>{renderSelectedForm()}</Box>
      </Modal>
      
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={sellers.error ? "error" : "success"} variant="filled" sx={{ width: "100%" }}>
          {sellers.error ? sellers.error : "Profile Updated Successfully"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;