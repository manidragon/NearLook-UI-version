import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchFollowedSellerProducts } from '../../../redux/Customer/ProductSlice';
import ProductCard from '../Products/ProductCard/ProductCard';
import { Typography, Box, Skeleton, Fade } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';

const FollowedSellersProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { followedSellerProducts, loading, error } = useAppSelector(state => state.products);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchFollowedSellerProducts());
  }, [dispatch]);

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      <Fade in={mounted} timeout={800}>
        <Box>
          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorefrontIcon sx={{ color: '#FF5A00' }} /> Following
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Latest products from sellers you follow
          </Typography>
        </Box>
      </Fade>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <Skeleton variant="rectangular" height={250} className="rounded-xl w-full" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center animate-fade-in">
          {error}
        </div>
      ) : followedSellerProducts.length === 0 ? (
        <Fade in={!loading} timeout={1000}>
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <StorefrontIcon sx={{ fontSize: 60, color: '#e5e7eb', mb: 2 }} />
            <Typography variant="h6" color="text.primary" fontWeight="600">
              No products yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: 300 }}>
              The sellers you follow haven't posted any products or you aren't following anyone.
            </Typography>
          </div>
        </Fade>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {followedSellerProducts.map((product, index) => (
            <Fade in={true} timeout={500 + index * 100} key={product._id || index}>
              <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl">
                <ProductCard item={product as any} />
              </div>
            </Fade>
          ))}
        </div>
      )}
    </Box>
  );
};

export default FollowedSellersProducts;
