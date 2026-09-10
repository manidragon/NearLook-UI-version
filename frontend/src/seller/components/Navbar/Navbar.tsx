import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/Store';

const Navbar = ({Sidebar}:any) => {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false);
  const { profile } = useAppSelector((state) => state.sellers);

  const toggleDrawer = (newOpen: any)=>() => {
    setOpen(newOpen);
    
  };

  return (
    <div className='h-[10vh] flex items-center px-5 border-b sticky top-0 z-50 bg-white/70 backdrop-blur-md w-full'>
      <div className='flex items-center lg:hidden'>
        <IconButton aria-label="Open sidebar menu" onClick={toggleDrawer(true)} color='primary'>
          <MenuIcon color='primary' />
        </IconButton>
      </div>

      {/* Centered Logo */}
      <div className='absolute left-1/2 -translate-x-1/2'>
        <div onClick={() => navigate("/")} className='cursor-pointer overflow-hidden h-10 w-28'>
          <img src="https://res.cloudinary.com/dt6nu9oqs/image/upload/f_auto,q_auto,w_400,c_limit/v1786088256/nearlook_uploads/walx5a8b8xft0xsc0bhc.png" alt="Near Look Logo" className="w-full h-full object-cover scale-[1.35] origin-center" />
        </div>
      </div>

      {/* Seller Profile Info */}
      <div 
        className="ml-auto hidden lg:flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 p-2 rounded-xl transition-colors duration-200" 
        onClick={() => navigate("/seller/account")}
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 m-0">{profile?.sellerName || "Seller"}</p>
          <p className="text-xs text-gray-500 m-0">{profile?.businessDetails?.businessName || "Business Account"}</p>
        </div>
        <Avatar 
          src={profile?.businessDetails?.logo} 
          alt={profile?.sellerName} 
          sx={{ width: 40, height: 40, bgcolor: '#FF5A00' }}
        >
          {profile?.sellerName?.charAt(0)?.toUpperCase()}
        </Avatar>
      </div>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Sidebar toggleDrawer={toggleDrawer} />
      </Drawer>
    </div>
  )
}

export default Navbar