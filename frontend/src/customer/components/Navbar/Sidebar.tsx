import { Box, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../redux/Store";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import { secureUrl } from "../../../util/secureUrl";

interface SidebarProps {
  toggleDrawer: (open: boolean) => () => void;
}

const Sidebar = ({ toggleDrawer }: SidebarProps) => {
  const navigate = useNavigate();
  const sellers = useAppSelector((state) => state.sellers);
  const user = useAppSelector((state) => state.user);

  const closeDrawer = () => {
    toggleDrawer(false)();
  };

  const becomeSellerClick = () => {
    closeDrawer();
    if (sellers.profile?._id) {
      navigate("/seller");
    } else {
      navigate("/become-seller");
    }
  };

  return (
    <Box 
      sx={{ 
        width: { xs: '80vw', sm: 300 }, 
        maxWidth: 320,
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f9fafb' 
      }} 
      role="presentation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div 
          onClick={() => { closeDrawer(); navigate("/"); }} 
          className="cursor-pointer m-0 flex items-center"
        >
          <span className="text-2xl font-black tracking-tighter text-[#FF5A00]">Near</span>
          <span className="text-2xl font-extrabold tracking-tight text-gray-800 ml-1">Look</span>
        </div>
        <IconButton onClick={closeDrawer} size="small" sx={{ color: 'text.secondary', bgcolor: '#f3f4f6' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      
      {/* Menu Items Container */}
      <div className="flex flex-col flex-grow p-4 gap-4 overflow-y-auto">
        
        {/* User Profile Section */}
        {user.user ? (
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            {user.user.profilePicture ? (
               <img src={secureUrl(user.user.profilePicture, 100)} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-50" alt="Profile" />
            ) : (
               <AccountCircleIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
            )}
            <div className="overflow-hidden">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }} noWrap>
                Hello, {user.user.fullName?.split(" ")[0]}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }} noWrap>
                {user.user.email}
              </Typography>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => {
              closeDrawer();
              window.dispatchEvent(new Event('open-login-modal'));
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
               <AccountCircleIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
            </div>
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>
                Welcome Guest
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                Login to access your account
              </Typography>
            </div>
          </div>
        )}

        <div className="mt-2">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Partner with us
          </div>

          {/* Become Seller Button */}
          <div 
            onClick={becomeSellerClick}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200/60 text-orange-800 shadow-sm group relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <StorefrontIcon sx={{ fontSize: 100 }} />
            </div>

            <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
              <StorefrontIcon sx={{ color: '#ea580c', fontSize: 24 }} />
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="font-bold text-[15px] leading-tight mb-0.5">
                {sellers.profile?._id ? "Seller Dashboard" : "Become a Seller"}
              </span>
              <span className="text-[12px] opacity-80 font-medium leading-tight">
                {sellers.profile?._id ? "Manage your store & sales" : "Start selling on Near Look"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-6 pb-2 w-full flex justify-center">
          <div className="bg-gray-100 px-4 py-1.5 rounded-full">
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
              © {new Date().getFullYear()} Near Look
            </Typography>
          </div>
        </div>
      </div>
    </Box>
  )
}

export default Sidebar;