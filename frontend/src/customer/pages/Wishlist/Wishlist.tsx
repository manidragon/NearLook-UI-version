import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { getWishlistByUserId } from '../../../redux/Customer/WishlistSlice';
import WishlistProductCard from './WishlistProductCard';
import '../Products/Products.css'; // Reuse exact layout styles from Products page
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { wishlist, loading, error } = useAppSelector(state => state.wishlist);

  // Fetch wishlist on mount
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      dispatch(getWishlistByUserId(jwt));
    }
  }, [dispatch]);

  // Handle loading state
  if (loading && !wishlist) {
    return (
      <div className="h-[85vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-2">Loading your wishlist...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="h-[85vh] flex justify-center items-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Safe check: ensure wishlist and products exist
  const products = wishlist?.products || [];

  return (
    <div className="products-page-wrapper">
      <div className="page" style={{ minHeight: '85vh', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: '20px' }}>
          
          {/* Exact Topbar style as Products page */}
          <header className="topbar" role="banner" style={{ marginBottom: '20px' }}>
            <div className="topbar__left">
              <div className="brand">
                <div className="brand__mark" aria-hidden="true" style={{ background: '#FF5A00', color: 'white', border: 'none' }}>
                  <FavoriteIcon sx={{ fontSize: 24, color: 'white' }} />
                </div>
                <div className="brand__text">
                  <h1 className="brand__title">My Wishlist</h1>
                  <p className="brand__sub">{products.length} {products.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="layout" role="main" style={{ gridTemplateColumns: '1fr' }}>
            <section className="catalog" aria-label="Wishlist results">
              {products.length > 0 ? (
                <div className="grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-3 lg:!grid-cols-4 xl:!grid-cols-5 gap-3 wishlist-grid">
                  {products.map((item) => (
                    <WishlistProductCard key={item._id || item.title} item={item} />
                  ))}
                </div>
              ) : (
                <div className="panel" style={{ padding: '60px', textAlign: 'center', marginTop: '12px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--card2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <FavoriteBorderIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '20px' }}>Your wishlist is empty</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Looks like you haven't added anything to your wishlist yet.</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </section>
          </main>
          
        </div>
      </div>
    </div>
  );
};

export default Wishlist;