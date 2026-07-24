import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = ({Sidebar}:any) => {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: any)=>() => {
    setOpen(newOpen);
    
  };

  return (
    <div className='sticky top-0 z-50 h-[10vh] flex items-center px-5 border-b border-white/20 backdrop-blur-2xl bg-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]'>
      {/* Left side: Hamburger Menu (Hidden on Desktop) */}
      <div className='flex-1 flex items-center lg:hidden'>
        <IconButton onClick={toggleDrawer(true)} color='primary'>
          <MenuIcon color='primary' />
        </IconButton>
      </div>

      {/* Left side spacer for Desktop to keep Logo centered */}
      <div className='hidden lg:flex flex-1' />

      {/* Center: Logo */}
      <div className='flex-1 flex justify-center'>
        <div onClick={() => navigate("/")} className='cursor-pointer overflow-hidden h-10 w-28 transition-transform hover:scale-105'>
          <img src="/logo.png" alt="Near Look Logo" className="w-full h-full object-cover scale-[1.35] origin-center drop-shadow-sm" />
        </div>
      </div>

      {/* Right side: Empty Spacer for perfect centering */}
      <div className='flex-1' />

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Sidebar toggleDrawer={toggleDrawer} />
      </Drawer>

    </div>
  )
}

export default Navbar