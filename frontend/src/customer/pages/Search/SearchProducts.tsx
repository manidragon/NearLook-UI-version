import { type ChangeEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProduct } from '../../../redux/Customer/ProductSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import ProductCard from '../Products/ProductCard/ProductCard';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CallMadeIcon from '@mui/icons-material/CallMade';
import type { Product } from '../../../types/productTypes';
import './SearchProducts.css';

const POPULAR_SEARCHES = [
  'mobiles', 'shoes', 't shirts', 'laptops', 'watches', 'tv',
  'sarees', 'headphones', 'bluetooth', 'fridge', 'bedsheet', 'water bottle'
];

const SearchProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products);
  const navigate = useNavigate();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length >= 1) {
      const timer = setTimeout(() => {
        if (value.trim()) {
          setShowSuggestions(true);
          dispatch(searchProduct({ query: value.trim() }));
        }
      }, 300);
      return () => clearTimeout(timer);
    } else if (value.trim().length === 0) {
      setShowSuggestions(false);
      setHasSearched(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowSuggestions(false);
        setHasSearched(true);
      }
    }
  };
  
  const handleSearchCommit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setHasSearched(true);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.title);
    setShowSuggestions(false);
    setHasSearched(true);
    dispatch(searchProduct({ query: product.title }));
  };

  const handlePillClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    setHasSearched(true);
    dispatch(searchProduct({ query: term }));
  };

  useEffect(() => {
    if (!searchQuery) {
      setHasSearched(false);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  return (
    <div className='bg-[#F1F3F6] min-h-[100dvh] pb-[60px] lg:pb-0'>
      {/* Mobile-style Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center px-2 py-1 max-w-[1400px] mx-auto">
          {/* Mobile Back Button (Visible <768px) */}
          <IconButton className="md:hidden" onClick={() => navigate(-1)} sx={{ color: '#555', display: { md: 'none' } }}>
            <ArrowBackIcon />
          </IconButton>
          
          {/* Custom Animated Search Box */}
          <div className="flex-1 flex justify-center py-1 min-w-0">
            <div className="custom-search relative w-full max-w-[400px]">
              <input
                autoFocus
                className="custom-search-txt"
                placeholder="Search for Products, Brands and More"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e as any)}
                onKeyDown={handleKeyPress}
              />
              <button 
                className="custom-search-btn"
                onClick={handleSearchCommit}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && products.searchProduct && products.searchProduct.length > 0 && (
                <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100 absolute top-full mt-3 left-0 right-0 z-50 rounded-2xl overflow-hidden divide-y divide-gray-50">
                  {products.searchProduct.slice(0, 8).map((product: Product) => (
                    <div 
                      key={product._id} 
                      className="group flex items-center p-3.5 hover:bg-[#FF5A00]/5 cursor-pointer transition-all duration-300"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      {(() => {
                        const imgUrl = product.images?.[0] || product.variants?.[0]?.images?.[0];
                        return imgUrl ? (
                          <div className="w-12 h-12 shrink-0 mr-4 rounded-lg border border-gray-100 bg-white shadow-sm p-1 flex items-center justify-center overflow-hidden">
                            <img src={imgUrl} className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" alt={product.title} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 shrink-0 bg-gray-50 mr-4 rounded-lg flex items-center justify-center border border-gray-100">
                             <span className="text-gray-400 text-[10px]">No img</span>
                          </div>
                        );
                      })()}
                      <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '15px' }} className="truncate text-gray-800 group-hover:text-[#FF5A00] transition-colors">
                          {product.title}
                        </Typography>
                        {product.category && (
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', mt: 0.2 }} className="truncate group-hover:text-gray-600 transition-colors">
                            in {typeof product.category === 'string' ? product.category : product.category.name}
                          </Typography>
                        )}
                      </div>
                      <CallMadeIcon className="text-gray-300 group-hover:text-[#FF5A00] transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" sx={{ fontSize: 20 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Loading Indicator in Header */}
          {products.loading && (
            <div className="pr-3">
              <CircularProgress size={20} sx={{ color: '#FF5A00' }} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Discover More Section (Only shown when no search query) */}
        {!hasSearched && !searchQuery && (
          <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 mt-6 mb-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 mx-2 lg:mx-0">
            <h3 className="text-gray-800 text-lg sm:text-xl font-bold mb-5 flex items-center gap-2">
              <span className="text-xl">✨</span> Discover More
            </h3>
            <div className="flex flex-wrap gap-3">
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => handlePillClick(term)}
                  className="px-5 py-2.5 bg-white/80 border border-gray-200/60 rounded-full text-gray-700 font-medium text-sm sm:text-base shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-[#FF5A00] hover:to-[#FF7E33] hover:text-white hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <section className="px-3 sm:px-4 mt-6 sm:mt-8 relative">

          {/* Loading State */}
          {products.loading && !showSuggestions && !hasSearched && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#FF5A00' }} />
            </Box>
          )}

          {/* Search Results */}
          {products.searchProduct && products.searchProduct.length > 0 && hasSearched && !showSuggestions ? (
            <div className="min-h-[500px]">
              <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {products.searchProduct.map((item: Product) => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 relative group cursor-pointer overflow-hidden">
                    <ProductCard item={item} />
                  </div>
                ))}
              </section>
            </div>
          ) : 
          // No Results State
          hasSearched && searchQuery.trim() && !products.loading && !showSuggestions ? (
            <Box className="flex flex-col items-center justify-center h-[60vh] text-center px-4 bg-white mt-2 shadow-sm py-10">
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found for "{searchQuery}"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try different keywords or check your spelling
              </Typography>
              <button
                onClick={() => { setSearchQuery(''); setHasSearched(false); }}
                className="mt-4 text-[#FF5A00] hover:underline font-medium"
              >
                Clear search
              </button>
            </Box>
          ) : null}

          {/* Error State */}
          {products.error && (
            <Box className="text-center py-10 bg-white shadow-sm rounded-sm mt-2">
              <Typography color="error" variant="body1">
                ⚠️ {products.error}
              </Typography>
              <button
                onClick={() => dispatch(searchProduct({ query: searchQuery }))}
                className="mt-4 text-[#FF5A00] hover:underline"
              >
                Try again
              </button>
            </Box>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchProducts;