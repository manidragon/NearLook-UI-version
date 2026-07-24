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
    <div className='h-[10vh] flex items-center px-5 border-b sticky top-0 z-50 bg-white/70 backdrop-blur-md'>
      <div className='flex items-center lg:hidden'>
        <IconButton onClick={toggleDrawer(true)} color='primary'>
          <MenuIcon color='primary' />
        </IconButton>
      </div>

      {/* Centered Logo */}
      <div className='absolute left-1/2 -translate-x-1/2'>
        <div onClick={() => navigate("/")} className='cursor-pointer overflow-hidden h-10 w-28'>
          <img src="/logo.png" alt="Near Look Logo" className="w-full h-full object-cover scale-[1.35] origin-center" />
        </div>
      </div>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Sidebar toggleDrawer={toggleDrawer} />
      </Drawer>
    </div>
  )
}

export default Navbar