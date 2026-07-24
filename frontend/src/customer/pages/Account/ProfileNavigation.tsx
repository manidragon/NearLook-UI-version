import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { performLogout } from '../../../redux/Customer/AuthSlice';
import '../../../SidebarGlider.css';

import LocalMallIcon from '@mui/icons-material/LocalMall';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const menu = [
  { name: "Orders", path: "/account/orders", icon: <LocalMallIcon sx={{ fontSize: 22 }} /> },
  { name: "Wallet", path: "/account/wallet", icon: <AccountBalanceWalletIcon sx={{ fontSize: 22 }} /> },
  { name: "Chats", path: "/account/chats", icon: <ChatIcon sx={{ fontSize: 22 }} /> },
  { name: "Profile", path: "/account/profile", icon: <PersonIcon sx={{ fontSize: 22 }} /> },
  { name: "Addresses", path: "/account/addresses", icon: <LocationOnIcon sx={{ fontSize: 22 }} /> },
  { name: "Logout", path: "/", icon: <LogoutIcon sx={{ fontSize: 22 }} /> }
];

const ProfileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);

  const handleLogout = () => {
    dispatch(performLogout());
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
    window.location.replace("/");
  };

  const handleClick = (item: any) => {
    if (item.name === "Logout") {
      handleLogout();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="w-full md:w-[28%] lg:w-[20%] flex-shrink-0 space-y-4 sticky top-4">
      
      {/* Hello User Card */}
      <div className="bg-gradient-to-r from-[#FF5A00] to-[#ff8447] shadow-md rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        <img 
          src={user.user?.profilePicture || "https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"} 
          alt="Profile" 
          className="w-[56px] h-[56px] rounded-full object-cover border-2 border-white shadow-sm z-10"
        />
        <div className="z-10 flex-1 min-w-0">
          <p className="text-[13px] text-white/80 font-medium">Hello,</p>
          <h1 className="text-[17px] md:text-[18px] font-bold text-white tracking-wide truncate" title={user.user?.fullName || "User"}>
            {user.user?.fullName || "User"}
          </h1>
        </div>
      </div>

      {/* Navigation Menu Card */}
      <div 
        className="bg-white shadow-md rounded-2xl border border-gray-50 h-auto flex flex-col radio-container overflow-hidden" 
        style={{ "--total-radio": menu.length } as React.CSSProperties}
      >
        <div className="glider-container">
          {menu.findIndex(item => item.path === location.pathname) !== -1 && (
            <div 
              className="glider" 
              style={{ transform: `translateY(${menu.findIndex(item => item.path === location.pathname) * 100}%)` }}
            ></div>
          )}
        </div>
        {menu.map((item, index) => {
          const isActive = item.path === location.pathname;
          return (
            <div
              key={item.path}
              onClick={() => handleClick(item)}
              className={`
                ${index !== menu.length - 1 ? "border-b border-gray-100" : ""}
                ${isActive ? "text-[#FF5A00] bg-orange-50/50 font-bold" : "text-gray-600"}
                px-5 py-4 hover:bg-orange-50 hover:text-[#FF5A00] cursor-pointer transition-all duration-300 flex items-center justify-between z-10
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`${isActive ? "text-[#FF5A00]" : "text-gray-400"} transition-colors duration-300`}>
                  {item.icon}
                </div>
                <p className="text-[15px]">{item.name}</p>
              </div>
              <ChevronRightIcon sx={{ fontSize: 20, color: isActive ? "#FF5A00" : "#d1d5db" }} />
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ProfileNavigation;
