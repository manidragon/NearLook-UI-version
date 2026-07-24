import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchCategories } from '../../../redux/Admin/CategorySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Badge, IconButton } from '@mui/material';
import { selectCartItemCount } from '../../../redux/Customer/CartSlice';

// Icons
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import FormatPaintOutlinedIcon from '@mui/icons-material/FormatPaintOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import FoundationOutlinedIcon from '@mui/icons-material/FoundationOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

const renderCategoryIcon = (name: string = '') => {
  const n = name.toLowerCase();
  let IconCmp = CategoryOutlinedIcon;
  if (n.includes('fashion') || n.includes('cloth')) IconCmp = CheckroomOutlinedIcon;
  else if (n.includes('mobile') || n.includes('phone')) IconCmp = SmartphoneOutlinedIcon;
  else if (n.includes('electronic') || n.includes('laptop')) IconCmp = LaptopMacOutlinedIcon;
  else if (n.includes('furniture') || n.includes('home')) IconCmp = ChairOutlinedIcon;
  else if (n.includes('hardware') || n.includes('paint')) IconCmp = FormatPaintOutlinedIcon;
  else if (n.includes('electrical') || n.includes('pipe')) IconCmp = BoltOutlinedIcon;
  else if (n.includes('grocer') || n.includes('food')) IconCmp = LocalGroceryStoreOutlinedIcon;
  else if (n.includes('auto') || n.includes('car') || n.includes('vehicle')) IconCmp = DirectionsCarOutlinedIcon;
  else if (n.includes('construction') || n.includes('material')) IconCmp = FoundationOutlinedIcon;
  else if (n.includes('beauty') || n.includes('personal')) IconCmp = FaceRetouchingNaturalOutlinedIcon;

  return <IconCmp sx={{ fontSize: 24, strokeWidth: 1.5 }} />;
};

const MobileCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const { categories, loading } = useAppSelector((state) => state.category);
  const user = useAppSelector((state) => state.user);

  const stateCategoryId = location.state?.categoryId as string | undefined;
  const [selectedL1, setSelectedL1] = useState<string | null>(stateCategoryId || null);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const levelOneCategories = useMemo(() => {
    return categories
      .filter(cat => cat.level === 1)
      .sort((a, b) => (a.order || 9999) - (b.order || 9999));
  }, [categories]);

  useEffect(() => {
    if (stateCategoryId) {
      setSelectedL1(stateCategoryId);
    } else if (levelOneCategories.length > 0 && !selectedL1) {
      setSelectedL1(levelOneCategories[0]._id);
    }
  }, [levelOneCategories, stateCategoryId, selectedL1]);

  const getLevelTwoCategories = () => {
    return categories
      .filter(cat => cat.level === 2 && cat.parentCategory === selectedL1)
      .sort((a, b) => (a.order || 9999) - (b.order || 9999));
  };

  const getLevelThreeCategories = (parentId: string) => {
    return categories
      .filter(cat => cat.level === 3 && cat.parentCategory === parentId)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  };

  const levelTwoCategories = getLevelTwoCategories();

  return (
    <div className="flex flex-col h-[100dvh] bg-white pb-[60px]">
      {/* App Bar */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon sx={{ color: '#1f2937' }} />
          </IconButton>
          <h1 className="text-lg font-semibold text-gray-800">All Categories</h1>
        </div>
        <div className="flex items-center gap-2 pr-2">
          <IconButton onClick={() => navigate('/search-products')}>
            <SearchIcon sx={{ color: '#1f2937' }} />
          </IconButton>
          <IconButton onClick={() => user.user ? navigate('/cart') : window.dispatchEvent(new Event('open-login-modal'))}>
            <Badge badgeContent={cartItemCount} sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF5A00', color: 'white' } }}>
              <AddShoppingCartIcon sx={{ color: '#1f2937' }} />
            </Badge>
          </IconButton>
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane (Level 1) */}
        <div className="w-[85px] shrink-0 bg-gray-50 overflow-y-auto hide-scrollbar border-r border-gray-100 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.02)]">
          {levelOneCategories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setSelectedL1(cat._id)}
              className={`flex flex-col items-center justify-center p-3 gap-1.5 cursor-pointer transition-all relative ${selectedL1 === cat._id ? 'bg-white shadow-sm z-10' : 'hover:bg-gray-100'}`}
            >
              {selectedL1 === cat._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[4px] bg-[#FF5A00] rounded-r-md"></div>
              )}
              <div className={`w-[45px] h-[45px] rounded-2xl flex items-center justify-center transition-all ${selectedL1 === cat._id ? 'bg-[#fff4ed] text-[#FF5A00] shadow-sm rotate-[-5deg] scale-105' : 'bg-gray-100 text-gray-500'}`}>
                 {renderCategoryIcon(cat.name)}
              </div>
              <span className={`text-[10px] text-center leading-tight transition-all ${selectedL1 === cat._id ? 'text-[#FF5A00] font-bold scale-105' : 'text-gray-500 font-medium'}`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right Pane (Level 2 & 3) */}
        <div className="flex-1 bg-white overflow-y-auto p-4 hide-scrollbar">
          {/* Vibrant Banner */}
          <div className="w-full h-[120px] bg-gradient-to-br from-[#FF5A00] to-[#ff914d] rounded-2xl mb-8 p-5 flex flex-col justify-center relative overflow-hidden shadow-lg shadow-orange-500/20">
            <span className="font-extrabold text-white text-lg relative z-10 w-3/4 leading-tight">Explore the Latest Trends</span>
            <div className="mt-3 bg-white/20 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center relative z-10 shadow-sm border border-white/40">&rarr;</div>
            {/* Decorative background elements */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl"></div>
            <div className="absolute right-4 top-2 w-16 h-16 bg-white opacity-20 rounded-full blur-xl"></div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><span className="text-gray-400 font-medium animate-pulse">Loading...</span></div>
          ) : levelTwoCategories.length === 0 ? (
             <div className="text-center text-gray-400 p-8 font-medium">No sub-categories found.</div>
          ) : (
            <div className="space-y-8">
              {levelTwoCategories.map((l2) => (
                <div key={l2._id}>
                  {/* Stylish Heading */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-1.5 h-5 bg-gradient-to-b from-[#00927c] to-[#00bda0] rounded-full shadow-sm"></div>
                    <h3 className="font-extrabold text-gray-800 text-[15px] tracking-wide">{l2.name}</h3>
                  </div>
                  
                  {/* Modern List Items */}
                  <ul className="space-y-2.5">
                    {getLevelThreeCategories(l2._id).map(l3 => (
                      <li 
                        key={l3._id} 
                        onClick={() => navigate(`/products/${l3._id}`)}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#00927c]/30 hover:bg-[#f0fdfa] active:scale-[0.98] transition-all cursor-pointer group"
                      >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-white">
                             <img 
                               src={l3.image && !l3.image.includes('flaticon.com') ? l3.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(l3.name || 'C')}&background=f3f4f6&color=6b7280&size=128`} 
                               alt={l3.name} 
                               className="w-full h-full object-cover" 
                               onError={(e) => {
                                 (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(l3.name || 'C')}&background=f3f4f6&color=6b7280&size=128`;
                               }}
                             />
                           </div>
                           <span className="text-gray-700 font-semibold text-[13px] group-hover:text-[#00927c] transition-colors">{l3.name}</span>
                         </div>
                         <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#00927c] transition-colors">
                           <ChevronRightIcon sx={{ fontSize: 16 }} className="text-gray-400 group-hover:text-white transition-colors" />
                         </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileCategories;
