import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction, Avatar, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import SellerRoutes from "../../../routes/SellerRoutes";
import Navbar from "../../components/Navbar/Navbar";
import SellerSidebar from "../../components/Sidebar/Sidebar";
import { useAppSelector } from "../../../redux/Store";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sellers = useAppSelector((state) => state.sellers);
  const chat = useAppSelector((state) => state.chat);
  
  const logoUrl = sellers.profile?.businessDetails?.logo;

  const isChatScreen = location.pathname.includes('/seller/chats');
  const isChatActive = isChatScreen && chat.currentChat !== null;

  // Determine current active tab based on pathname
  let currentTab = 0;
  if (location.pathname.includes("/stock")) currentTab = 1;
  else if (location.pathname.includes("/orders")) currentTab = 2;
  else if (location.pathname.includes("/account")) currentTab = 3;

  const [value, setValue] = useState(currentTab);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${isChatActive ? 'pb-0' : 'pb-28 lg:pb-0'}`}>
      <div className={isChatActive ? 'hidden lg:block' : 'block'}>
        <Navbar Sidebar={SellerSidebar} />
      </div>
      <section className="flex-grow lg:flex lg:h-[90vh]">
        <div className="hidden lg:block h-full border-r border-gray-200 bg-white z-10 relative">
          <SellerSidebar />
        </div>
        <div className={`w-full lg:flex-1 overflow-y-auto relative z-0 ${isChatActive ? 'p-0 h-[100vh] lg:h-[90vh]' : 'p-4 sm:p-6 lg:p-8 bg-gray-50'}`}>
          <SellerRoutes />
        </div>
      </section>

      {/* Modern Floating Mobile Bottom Navigation (Liquid Glassmorphism) */}
      {!isChatActive && (
        <Box className="block lg:hidden" sx={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 50 }}>
          <Paper elevation={0} sx={{ 
            borderRadius: '24px', 
            overflow: 'hidden', 
            bgcolor: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
          }}>
            <BottomNavigation
              showLabels
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
                if (newValue === 0) navigate("/seller");
                else if (newValue === 1) navigate("/seller/stock");
                else if (newValue === 2) navigate("/seller/orders");
                else if (newValue === 3) navigate("/seller/account");
              }}
              sx={{
                height: 70,
                bgcolor: 'transparent',
                '& .MuiBottomNavigationAction-root': {
                  minWidth: 'auto',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  color: 'text.secondary',
                },
                '& .Mui-selected': {
                  color: '#FF5A00',
                  transform: 'translateY(-4px)',
                  '& .MuiBottomNavigationAction-label': {
                     fontWeight: 700,
                  },
                  '& .MuiSvgIcon-root, & .MuiAvatar-root': {
                    color: '#FF5A00',
                    transform: 'scale(1.25)',
                    filter: 'drop-shadow(0px 8px 10px rgba(255, 90, 0, 0.35))'
                  }
                }
              }}
            >
              <BottomNavigationAction label="Home" icon={<HomeIcon />} />
              <BottomNavigationAction label="Stock" icon={<InventoryIcon />} />
              <BottomNavigationAction label="Orders" icon={<ListAltIcon />} />
              <BottomNavigationAction 
                label="Account" 
                icon={
                  logoUrl ? (
                    <Avatar src={logoUrl} sx={{ width: 26, height: 26, border: value === 3 ? '2px solid' : 'none', borderColor: 'primary.main' }} />
                  ) : (
                    <AccountCircleIcon />
                  )
                } 
              />
            </BottomNavigation>
          </Paper>
        </Box>
      )}
    </div>
  );
};

export default SellerDashboard;
