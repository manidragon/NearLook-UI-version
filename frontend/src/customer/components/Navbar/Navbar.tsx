// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\components\Navbar\Navbar.tsx
import { Avatar, Badge, Box, Button, Drawer, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, Divider, TextField, Typography, Autocomplete } from '@mui/material';
import React, { useEffect, useState, Suspense } from "react";
import "./Navbar.css";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { secureUrl } from "../../../util/secureUrl";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import CategorySheet from "./CategorySheet";
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { selectCartItemCount } from "../../../redux/Customer/CartSlice";
import { fetchCategories } from "../../../redux/Admin/CategorySlice";
// ✅ FIX 1: Comment out setLocationFilter import temporarily (we'll add it next)
import { setLocationFilter } from "../../../redux/Customer/ProductSlice";
const Auth = React.lazy(() => import("../../pages/Auth/Auth"));

// ✅ Icon imports for categories
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import FoundationOutlinedIcon from '@mui/icons-material/FoundationOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ToysOutlinedIcon from '@mui/icons-material/ToysOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';

import CustomLoader from "../../../components/CustomLoader";

const renderCategoryIcon = (name: string = '') => {
  const n = name.toLowerCase();
  let IconCmp = CategoryOutlinedIcon;
  if (n.includes('fashion') || n.includes('cloth')) IconCmp = CheckroomOutlinedIcon;
  else if (n.includes('mobile') || n.includes('phone')) IconCmp = SmartphoneOutlinedIcon;
  else if (n.includes('electronic') || n.includes('laptop')) IconCmp = LaptopMacOutlinedIcon;
  else if (n.includes('appliance')) IconCmp = KitchenOutlinedIcon;
  else if (n.includes('improvement') || n.includes('hardware') || n.includes('paint')) IconCmp = HandymanOutlinedIcon;
  else if (n.includes('furniture')) IconCmp = ChairOutlinedIcon;
  else if (n.includes('electrical') || n.includes('pipe')) IconCmp = BoltOutlinedIcon;
  else if (n.includes('grocer') || n.includes('food')) IconCmp = LocalGroceryStoreOutlinedIcon;
  else if (n.includes('automotive') || n.includes('auto ') || n.includes('vehicle')) IconCmp = DirectionsCarOutlinedIcon;
  else if (n.includes('construction') || n.includes('material')) IconCmp = FoundationOutlinedIcon;
  else if (n.includes('beauty') || n.includes('personal')) IconCmp = FaceRetouchingNaturalOutlinedIcon;
  else if (n.includes('sport') || n.includes('fitness') || n.includes('outdoor')) IconCmp = FitnessCenterOutlinedIcon;
  else if (n.includes('toy') || n.includes('baby') || n.includes('stationery')) IconCmp = ToysOutlinedIcon;
  else if (n.includes('pet')) IconCmp = PetsOutlinedIcon;

  return (
    <div className="relative flex items-center justify-center">
      <IconCmp sx={{ fontSize: 26, color: '#2c2c2c', zIndex: 10, position: 'relative', strokeWidth: 1.5 }} />
      {/* Flipkart-like yellow highlight behind the icon */}
      <div className="absolute w-[12px] h-[12px] bg-[#ffd700] rounded-full bottom-[0px] right-[-2px] z-0 opacity-90"></div>
    </div>
  );
};

// ✅ Tamil Nadu districts list
const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

interface NavbarProps {
  hideMobileNav?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hideMobileNav = false }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-login-modal', handleOpenAuth);
    return () => window.removeEventListener('open-login-modal', handleOpenAuth);
  }, []);

  const theme = useTheme();
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = useAppSelector((state) => state.user);
  const auth = useAppSelector((state) => state.auth);
  const sellers = useAppSelector((state) => state.sellers);
  const { categories, loading } = useAppSelector((state) => state.category);

  const [open, setOpen] = React.useState(false);

  // ✅ Location selector state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationMode, setLocationMode] = useState<'current' | 'district' | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // ✅ Sort Level 1 categories by ORDER field
  const levelOneCategories = React.useMemo(() => {
    return categories
      .filter(cat => cat.level === 1)
      .sort((a, b) => {
        const orderA = a.order || 999999;
        const orderB = b.order || 999999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [categories]);

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);
  const becomeSellerClick = () => {
    if (sellers.profile?._id) {
      navigate("/seller");
    } else {
      navigate("/become-seller");
    }
  };

  // ✅ FIX 2: Remove duplicate - keep only ONE cartItemCount declaration
  const cartItemCount = useAppSelector(selectCartItemCount);

  // ✅ Location modal handlers
  const handleLocationModalOpen = () => {
    setLocationModalOpen(true);
  };

  const handleLocationModalClose = () => {
    setLocationModalOpen(false);
  };

  useEffect(() => {
    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocationMode(parsed.mode);
        setUserCoords(parsed.coordinates || null);
        setSelectedDistrict(parsed.district || '');

        // Dispatch to Redux
        if (parsed.mode === 'current' && parsed.coordinates) {
          dispatch(setLocationFilter({
            type: 'current',
            coordinates: parsed.coordinates,
            radiusKm: parsed.radiusKm || 50
          }));
        } else if (parsed.mode === 'district' && parsed.district) {
          dispatch(setLocationFilter({
            type: 'district',
            district: parsed.district
          }));
        }
      } catch (error) {
        console.error('Failed to parse saved location:', error);
      }
    }
  }, [dispatch]);

  const handleLocationSelect = (mode: 'current' | 'district') => {
    setLocationMode(mode);
    handleLocationModalClose();

    if (mode === 'current') {
      handleGetCurrentLocation();
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        setUserCoords(coords);
        setLocationLoading(false);

        // ✅ Save to localStorage
        const locationData = {
          mode: 'current' as const,
          coordinates: coords,
          radiusKm: 50,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('userLocation', JSON.stringify(locationData));

        // Dispatch to Redux
        dispatch(setLocationFilter({
          type: 'current',
          coordinates: coords,
          radiusKm: 50
        }));
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(error.message || 'Failed to get location');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDistrictChange = (district: string) => {
    setLocationMode('district');
    setSelectedDistrict(district);

    // ✅ Save to localStorage
    const locationData = {
      mode: 'district' as const,
      district,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('userLocation', JSON.stringify(locationData));

    // Dispatch to Redux
    dispatch(setLocationFilter({
      type: 'district',
      district
    }));

    handleLocationModalClose();
  };


  const handleClearLocation = () => {
    setLocationMode(null);
    setUserCoords(null);
    setSelectedDistrict('');

    // ✅ Remove from localStorage
    localStorage.removeItem('userLocation');

    // Clear Redux
    dispatch(setLocationFilter(null));
  };

  const renderLocationSelector = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <div
          onClick={handleLocationModalOpen}
          className="flex items-center text-[10px] sm:text-xs lg:text-[14px] cursor-pointer text-gray-700 font-medium gap-1 lg:gap-2 border border-gray-200 rounded-xl px-2 py-1 lg:px-3 lg:py-1.5 hover:bg-gray-50 transition-colors bg-white shadow-sm max-w-[85px] sm:max-w-[140px] lg:max-w-none overflow-hidden shrink-0"
        >
          <LocationOnIcon sx={{ fontSize: { xs: 16, lg: 20 }, color: 'red', flexShrink: 0 }} />
          {locationLoading ? (
            <span className="text-gray-600 truncate">Wait...</span>
          ) : locationMode === 'current' && userCoords ? (
            <span className="truncate">
              <span className="text-gray-800 font-medium">Current</span> 
              <span className="text-[#FF5A00] hidden lg:inline"> Selected &gt;</span>
            </span>
          ) : locationMode === 'district' && selectedDistrict ? (
            <span className="truncate">
              <span className="text-gray-800 font-medium">{selectedDistrict}</span> 
              <span className="text-[#FF5A00] hidden lg:inline"> Selected &gt;</span>
            </span>
          ) : (
            <span className="truncate">
              <span className="text-gray-800 font-medium hidden lg:inline">Select Location</span>
              <span className="text-gray-800 font-medium lg:hidden">Location</span>
            </span>
          )}
        </div>

        <Dialog
          open={locationModalOpen}
          onClose={handleLocationModalClose}
          sx={{ zIndex: 99999 }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              p: 2
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" pb={1}>
            <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: '1.25rem' }}>
              Select your location
            </DialogTitle>
            <IconButton onClick={handleLocationModalClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ p: '10px 0 0 0' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Current Location Option */}
              <Box
                onClick={() => {
                  if (!locationLoading) handleLocationSelect('current');
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  cursor: locationLoading ? 'not-allowed' : 'pointer',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s',
                  backgroundColor: locationLoading ? '#f5f5f5' : 'transparent',
                  opacity: locationLoading ? 0.7 : 1,
                  '&:hover': {
                    borderColor: locationLoading ? '#e0e0e0' : '#FF5A00',
                    backgroundColor: locationLoading ? '#f5f5f5' : '#fff8f5'
                  }
                }}
              >
                {locationLoading ? (
                  <CustomLoader size={24} sx={{ color: '#FF5A00' }} />
                ) : (
                  <GpsFixedIcon sx={{ color: '#FF5A00', fontSize: 26 }} />
                )}
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    {locationLoading ? 'Detecting location...' : 'Use current location'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#777' }}>Using GPS</Typography>
                </Box>
              </Box>

              {/* OR Divider */}
              <Divider>
                <Typography variant="body2" sx={{ color: '#999', px: 1, fontWeight: 600 }}>OR</Typography>
              </Divider>

              {/* Select District Option */}
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#333', mb: 1.5 }}>Select District</Typography>
                <Autocomplete
                  options={[...TN_DISTRICTS].sort()}
                  value={selectedDistrict || null}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      handleDistrictChange(newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Search and choose district" 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  )}
                  slotProps={{
                    popper: {
                      sx: { zIndex: 100000 }
                    }
                  }}
                />
              </Box>

              {locationError && (
                <Typography variant="body2" color="error" textAlign="center">
                  {locationError}
                </Typography>
              )}

              {locationMode && (
                <Button 
                  onClick={handleClearLocation} 
                  color="error" 
                  sx={{ textTransform: 'none', fontWeight: 600, mt: -1 }}
                >
                  Clear Location
                </Button>
              )}

              {/* Explore Nearby Button / Map View */}
              <Divider sx={{ my: 1 }} />
              <Box
                onClick={() => {
                  handleLocationModalClose();
                  navigate("/explore-nearby");
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#eff6ff', // blue-50
                  border: '1px solid #bfdbfe', // blue-200
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#dbeafe', // blue-100
                    borderColor: '#93c5fd'
                  }
                }}
              >
                <MapIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#1e40af' }}>
                    Map View
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3b82f6' }}>Explore products visually</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  const chat = useAppSelector((state) => state.chat);
  const isChatActive = location.pathname.includes('/account/chats') && chat.currentChat !== null;

  const isMobileCategoriesPage = location.pathname === '/mobile-categories';
  const isMobileSearchPage = location.pathname === '/search-products' && !isLarge;
  const isMobileAccountPage = location.pathname.startsWith('/account') && !location.pathname.includes('/account/chats') && !isLarge;
  const isMobileCartPage = location.pathname === '/cart' && !isLarge;
  const hideTopNav = isMobileCategoriesPage || isMobileSearchPage || isMobileAccountPage || isMobileCartPage || (isChatActive && !isLarge);

  return (
    <>
      {!hideTopNav && (
      <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
      }}
      className="shadow-sm bg-white/70 backdrop-blur-md border-b border-white/50"
    >
      <div className="px-2 sm:px-5 lg:px-20 py-3">
        {/* Single Row: Logo, Location, Search, Login, More, Cart */}
        <div className="flex flex-row flex-nowrap items-center justify-between gap-x-1 sm:gap-x-2 lg:gap-8 w-full">
          
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-6 shrink-0">
            {!isLarge && (
              <IconButton aria-label="Open menu" onClick={toggleDrawer(true)} sx={{ p: 0, mr: 0.5 }}>
                <MenuIcon className="text-gray-700" />
              </IconButton>
            )}

            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center overflow-hidden h-10 w-24 sm:h-12 sm:w-32 shrink-0"
            >
              <img src="https://res.cloudinary.com/dt6nu9oqs/image/upload/f_auto,q_auto,w_400,c_limit/v1786088256/nearlook_uploads/walx5a8b8xft0xsc0bhc.png" alt="Near Look Logo" className="w-full h-full object-cover scale-[1.35] origin-center" />
            </div>

            {/* Travel / Become Seller Button */}
            {isLarge && (
              <div
                onClick={becomeSellerClick}
                className="bg-white border border-gray-200 shadow-sm text-gray-700 font-medium px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 hover:bg-gray-50 transition-colors text-[14px] shrink-0"
              >
                <StorefrontIcon sx={{ color: '#ff6161', fontSize: 18 }} />
                <span>Seller</span>
              </div>
            )}
            
            {/* Explore Nearby Button moved to location modal */}
            
            {/* Location Selector - Desktop Only */}
            <div className="hidden lg:flex items-center w-full lg:w-auto order-2 lg:order-none mt-1 lg:mt-0">
              {renderLocationSelector()}
            </div>
          </div>

          {/* Mobile Right Side Actions (Location + Wishlist) */}
          <div className="flex lg:hidden items-center gap-1 ml-auto">
            <div className="flex items-center">
              {renderLocationSelector()}
            </div>
            <IconButton 
              aria-label="Wishlist"
              onClick={() => {
                if (user.user) {
                  navigate("/wishlist");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              sx={{ p: 1 }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: '#ff4081' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
              </svg>
            </IconButton>
          </div>

          {/* Action Icons */}
          <ul className="hidden lg:flex items-center gap-2 lg:gap-6 shrink-0 order-2 lg:order-none lg:ml-auto">
            {/* Search */}
            <li
              onClick={() => navigate("/search-products")}
              style={{ '--gradient-from': '#333333', '--gradient-to': '#000000' } as React.CSSProperties}
              className="relative hidden lg:flex w-[45px] h-[45px] bg-white shadow-md rounded-full items-center justify-center transition-all duration-500 hover:w-[120px] hover:shadow-none group cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              <span className="absolute top-[5px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0 flex items-center justify-center">
                <SearchIcon sx={{ fontSize: 26, color: "#6b7280" }} />
              </span>
              <span className="absolute text-white uppercase tracking-wide text-xs font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
                Search
              </span>
            </li>
            {/* Login / Profile */}
            <li
              onClick={() => {
                if (user.user) {
                  navigate("/account/orders");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              style={{ '--gradient-from': '#333333', '--gradient-to': '#000000' } as React.CSSProperties}
              className="relative w-[45px] h-[45px] bg-white shadow-md rounded-full flex items-center justify-center transition-all duration-500 hover:w-[120px] hover:shadow-none group cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              <span className="absolute top-[5px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0 flex items-center justify-center">
                {user.user ? (
                  <Avatar sx={{ width: 28, height: 28 }} src={secureUrl(user.user?.profilePicture || "", 100)} alt={user.user?.fullName || "User Profile"} />
                ) : (
                  <AccountCircleIcon sx={{ fontSize: 26, color: "#6b7280" }} />
                )}
              </span>
              <span className="absolute text-white uppercase tracking-wide text-xs font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
                {user.user?.fullName?.split(" ")[0] || "Login"}
              </span>
            </li>

            {/* Wishlist */}
            <li
              onClick={() => {
                if (user.user) {
                  navigate("/wishlist");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              style={{ '--gradient-from': '#333333', '--gradient-to': '#000000' } as React.CSSProperties}
              className="relative hidden lg:flex w-[45px] h-[45px] bg-white shadow-md rounded-full items-center justify-center transition-all duration-500 hover:w-[120px] hover:shadow-none group cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              <span className="absolute top-[5px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0 flex items-center justify-center">
                <FavoriteBorderIcon sx={{ fontSize: 26, color: "#6b7280" }} />
              </span>
              <span className="absolute text-white uppercase tracking-wide text-xs font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
                Wishlist
              </span>
            </li>

            {/* Cart */}
            <li
              onClick={() => {
                if (user.user) {
                  navigate("/cart");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              style={{ '--gradient-from': '#333333', '--gradient-to': '#000000' } as React.CSSProperties}
              className="relative w-[45px] h-[45px] bg-white shadow-md rounded-full flex items-center justify-center transition-all duration-500 hover:w-[120px] hover:shadow-none group cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
              <span className="absolute top-[5px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
              <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0 flex items-center justify-center">
                <Badge badgeContent={cartItemCount} sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF5A00', color: 'white' } }}>
                  <AddShoppingCartIcon sx={{ fontSize: 26, color: "#6b7280" }} />
                </Badge>
              </span>
              <span className="absolute text-white uppercase tracking-wide text-xs font-semibold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
                Cart
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Category Bar */}
      {(isLarge || location.pathname === '/') && (
      <div className={`px-5 lg:px-20 border-t border-gray-200 transition-all duration-300 ${!isLarge && isScrolled ? 'pt-1' : 'pt-2'}`}>
        <div className={`w-full flex items-center justify-between overflow-x-auto gap-4 lg:gap-2 no-scrollbar transition-all duration-300 ${!isLarge && isScrolled ? 'py-0' : 'py-1 lg:py-0'}`}>
          {levelOneCategories.map((category) => (
            <div key={category._id} className="flex-shrink-0">
              <div
                onClick={() => { if (!isLarge) navigate("/mobile-categories", { state: { categoryId: category._id } }); }}
                onMouseLeave={() => setShowSheet(false)}
                onMouseEnter={() => { setSelectedCategory(category._id); setShowSheet(true); }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer min-w-max group relative transition-all duration-300 ${!isLarge && isScrolled ? 'pb-1' : 'pb-2'}`}
              >
                {/* Flipkart Style Line-Art Category Icon */}
                <div 
                  className={`flex items-center justify-center p-1 rounded-xl transition-all duration-300 ease-in-out overflow-hidden origin-bottom
                    ${!isLarge && isScrolled ? 'h-0 opacity-0 mb-0 scale-50 w-[48px]' : 'h-[48px] w-[48px] opacity-100 mb-0 scale-100'}
                    ${selectedCategory === category._id && showSheet ? 'bg-[#fff0e6]' : 'bg-transparent group-hover:bg-gray-50'}`}
                >
                  {renderCategoryIcon(category.name)}
                </div>
                <span className={`text-[12px] transition-colors ${selectedCategory === category._id && showSheet ? 'font-bold text-[#FF5A00]' : 'font-semibold text-gray-700 group-hover:text-[#FF5A00]'}`}>
                  {category.name || 'Unnamed'}
                </span>

                {/* Active indicator bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-[4px] rounded-t-md transition-colors ${selectedCategory === category._id && showSheet ? 'bg-[#FF5A00]' : 'bg-transparent'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Sidebar toggleDrawer={toggleDrawer} />
      </Drawer>

      {showSheet && selectedCategory && (
        <div onMouseLeave={() => setShowSheet(false)} onMouseEnter={() => setShowSheet(true)} className="categorySheet absolute top-full left-10 right-10 xl:left-20 xl:right-20 z-[9999] hidden lg:block">
          <CategorySheet setShowSheet={setShowSheet} selectedCategory={selectedCategory} />
        </div>
      )}
    </Box>
    )}

    {/* Render Auth modal globally */}
    <React.Suspense fallback={null}>
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <Auth open={isAuthModalOpen} handleClose={() => setIsAuthModalOpen(false)} />
        </Suspense>
      )}
    </React.Suspense>

    {/* Mobile Bottom Navigation - Glassmorphic, Animated */}
    {!isAuthModalOpen && !hideMobileNav && !(isChatActive && !isLarge) && (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] lg:hidden flex justify-center pb-safe">
        <div className="flex justify-around items-center w-full max-w-[420px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-2 py-1.5">
          {/* Home */}
          <div onClick={() => navigate("/")} className="relative flex flex-col items-center justify-center w-[20%] h-[52px] cursor-pointer group">
            <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-[#FF5A00]/10 rounded-full transition-all duration-500 ease-out ${location.pathname === '/' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            <StorefrontIcon sx={{ color: location.pathname === '/' ? '#FF5A00' : '#6b7280', fontSize: 24, transition: 'all 0.4s ease-out' }} className={location.pathname === '/' ? '-translate-y-2.5 scale-110 drop-shadow-md' : 'translate-y-0'} />
            <span className={`text-[10px] absolute bottom-1 transition-all duration-400 font-bold tracking-wide ${location.pathname === '/' ? 'text-[#FF5A00] opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-2 scale-75'}`}>Home</span>
          </div>
          {/* Categories */}
          <div onClick={() => navigate("/mobile-categories")} className="relative flex flex-col items-center justify-center w-[20%] h-[52px] cursor-pointer group">
            <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-[#FF5A00]/10 rounded-full transition-all duration-500 ease-out ${location.pathname === '/mobile-categories' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            <CategoryOutlinedIcon sx={{ color: location.pathname === '/mobile-categories' ? '#FF5A00' : '#6b7280', fontSize: 24, transition: 'all 0.4s ease-out' }} className={location.pathname === '/mobile-categories' ? '-translate-y-2.5 scale-110 drop-shadow-md' : 'translate-y-0'} />
            <span className={`text-[9px] absolute bottom-1 transition-all duration-400 font-bold tracking-wide ${location.pathname === '/mobile-categories' ? 'text-[#FF5A00] opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-2 scale-75'}`}>Categories</span>
          </div>
          {/* Search */}
          <div onClick={() => navigate("/search-products")} className="relative flex flex-col items-center justify-center w-[20%] h-[52px] cursor-pointer group">
            <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-[#FF5A00]/10 rounded-full transition-all duration-500 ease-out ${location.pathname === '/search-products' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            <SearchIcon sx={{ color: location.pathname === '/search-products' ? '#FF5A00' : '#6b7280', fontSize: 24, transition: 'all 0.4s ease-out' }} className={location.pathname === '/search-products' ? '-translate-y-2.5 scale-110 drop-shadow-md' : 'translate-y-0'} />
            <span className={`text-[10px] absolute bottom-1 transition-all duration-400 font-bold tracking-wide ${location.pathname === '/search-products' ? 'text-[#FF5A00] opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-2 scale-75'}`}>Search</span>
          </div>
          {/* Cart */}
          <div onClick={() => { user.user ? navigate("/cart") : setIsAuthModalOpen(true); }} className="relative flex flex-col items-center justify-center w-[20%] h-[52px] cursor-pointer group">
            <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-[#FF5A00]/10 rounded-full transition-all duration-500 ease-out ${location.pathname === '/cart' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            <Badge badgeContent={cartItemCount} sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF5A00', color: 'white', transition: 'all 0.3s' } }} className={`transition-all duration-400 ease-out ${location.pathname === '/cart' ? '-translate-y-2.5 scale-110 drop-shadow-md' : 'translate-y-0'}`}>
              <AddShoppingCartIcon sx={{ color: location.pathname === '/cart' ? '#FF5A00' : '#6b7280', fontSize: 24, transition: 'color 0.4s' }} />
            </Badge>
            <span className={`text-[10px] absolute bottom-1 transition-all duration-400 font-bold tracking-wide ${location.pathname === '/cart' ? 'text-[#FF5A00] opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-2 scale-75'}`}>Cart</span>
          </div>
          {/* Account */}
          <div onClick={() => { user.user ? navigate("/account") : setIsAuthModalOpen(true); }} className="relative flex flex-col items-center justify-center w-[20%] h-[52px] cursor-pointer group">
            <div className={`absolute inset-0 bg-gradient-to-b from-white/80 to-[#FF5A00]/10 rounded-full transition-all duration-500 ease-out ${location.pathname.includes('/account') ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            <div className={`transition-all duration-400 ease-out ${location.pathname.includes('/account') ? '-translate-y-2.5 scale-110 drop-shadow-md' : 'translate-y-0'}`}>
              {user.user ? (
                <Avatar sx={{ width: 24, height: 24, border: location.pathname.includes('/account') ? '2px solid #FF5A00' : '2px solid transparent', transition: 'border 0.4s' }} src={secureUrl(user.user?.profilePicture || "", 100)} alt={user.user?.fullName || "User Profile"} />
              ) : (
                <AccountCircleIcon sx={{ color: location.pathname.includes('/account') ? '#FF5A00' : '#6b7280', fontSize: 24, transition: 'color 0.4s' }} />
              )}
            </div>
            <span className={`text-[10px] absolute bottom-1 transition-all duration-400 font-bold tracking-wide ${location.pathname.includes('/account') ? 'text-[#FF5A00] opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-2 scale-75'}`}>Account</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;