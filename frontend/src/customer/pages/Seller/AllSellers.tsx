import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchSellers } from '../../../redux/Seller/sellerSlice';
import { fetchSellerReviews } from '../../../redux/Customer/SellerReviewSlice';
import { secureUrl } from '../../../util/secureUrl';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import CustomLoader from '../../../components/CustomLoader';
import { TextField, InputAdornment } from '@mui/material';

const AllSellers = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sellers, loading, error } = useAppSelector((state) => state.sellers);
  const sellerReviewState = useAppSelector((state) => state.sellerReview);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Only fetch if we don't have sellers loaded
    if (!sellers || sellers.length === 0) {
      dispatch(fetchSellers(''));
    }
  }, [dispatch, sellers]);

  useEffect(() => {
    if (sellers) {
      sellers.forEach(seller => {
        if (seller._id && !sellerReviewState.reviewsBySeller[seller._id]) {
          dispatch(fetchSellerReviews({ sellerId: seller._id }));
        }
      });
    }
  }, [dispatch, sellers]);

  // Filter sellers based on search
  const filteredSellers = useMemo(() => {
    if (!sellers) return [];
    if (!searchTerm.trim()) return sellers;
    const term = searchTerm.toLowerCase().trim();
    return sellers.filter(
      (seller) =>
        seller.businessDetails?.businessName?.toLowerCase().includes(term) ||
        seller.sellerName?.toLowerCase().includes(term)
    );
  }, [sellers, searchTerm]);

  if (loading && (!sellers || sellers.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CustomLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <StorefrontIcon className="text-orange-600" sx={{ fontSize: 32 }} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Sellers</h1>
              <p className="text-gray-500 text-sm mt-1">Find the best local stores and brands</p>
            </div>
          </div>
          
          <div className="w-full md:w-96">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by store name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#FF5A00' },
                  '&.Mui-focused fieldset': { borderColor: '#FF5A00', borderWidth: '2px' },
                }
              }}
            />
          </div>
        </div>

        {(!filteredSellers || filteredSellers.length === 0) ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <StorefrontIcon sx={{ fontSize: 64 }} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No sellers found</h3>
            <p className="text-gray-500">We couldn't find any sellers matching "{searchTerm}".</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-6 px-6 py-2 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '24px' 
            }}
          >
            {filteredSellers.map((seller) => {
              const realReviewCount = sellerReviewState.reviewsBySeller[seller._id]?.length;
              const displayReviewCount = realReviewCount !== undefined ? realReviewCount : (seller?.totalReviews || 0);
              const avg = realReviewCount 
                ? sellerReviewState.reviewsBySeller[seller._id].reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / realReviewCount 
                : (seller?.averageRating || 0);

              return (
                <div 
                  key={seller._id}
                  onClick={() => navigate(`/seller-profile/${seller._id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgba(255,90,0,0.12)] transition-all duration-300 p-6 flex flex-col items-center cursor-pointer border border-gray-100 hover:border-orange-200 group relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-100 to-red-50 p-1 mb-5 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-white">
                      {seller.businessDetails?.logo ? (
                        <img src={secureUrl(seller.businessDetails.logo, 150)} alt={seller.businessDetails.businessName || "Seller"} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-orange-500">
                          {seller.businessDetails?.businessName?.charAt(0)?.toUpperCase() || "S"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-[15px] font-bold text-gray-800 text-center line-clamp-2 mb-3 min-h-[44px] group-hover:text-orange-600 transition-colors">
                    {seller.businessDetails?.businessName || seller.sellerName || "Seller"}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1.5 mt-auto bg-gray-50 px-3 py-1.5 rounded-full w-full">
                    {displayReviewCount > 0 ? (
                      <>
                        <StarIcon className="text-yellow-400" sx={{ fontSize: 16 }} />
                        <span className="text-sm font-semibold text-gray-700">{avg.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 font-medium">({displayReviewCount} reviews)</span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-orange-600 tracking-wide uppercase">
                        ⭐ New Seller
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSellers;
