// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Home\Home.tsx
import { useState, useEffect } from 'react'
import TopBrand from './TopBrands/Grid'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Button from "../../../components/NeonButton";
import CustomLoader from "../../../components/CustomLoader";
import { Backdrop } from "@mui/material"
import ChatBot from '../ChatBot/ChatBot'
import { useNavigate } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAppSelector, useAppDispatch } from '../../../redux/Store'
import DealSlider from './Deals/DealSlider'
import { fetchCategories } from '../../../redux/Admin/CategorySlice';
import ProductSlider from './ProductSlider';
import { fetchFollowedSellerProducts, fetchRecentlyAddedProducts, fetchTopSellingProducts, fetchProductsNearYou } from '../../../redux/Customer/ProductSlice';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CuratedCollections from './CuratedCollections';
import { fetchSellers } from '../../../redux/Seller/sellerSlice';
import FeaturedSellersSlider from './FeaturedSellersSlider';

const Home = () => {
    const [showChatBot, setShowChatBot] = useState(false)
    const products = useAppSelector(state => state.products);
    const auth = useAppSelector(state => state.auth);
    const homePage = useAppSelector(state => state.homePage);
    const sellers = useAppSelector(state => state.sellers);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchRecentlyAddedProducts());
        dispatch(fetchTopSellingProducts());
        dispatch(fetchSellers("ACTIVE"));
        
        // Fetch local products
        if (products.locationFilter) {
            dispatch(fetchProductsNearYou(products.locationFilter));
        } else {
            const locStr = localStorage.getItem('userLocation');
            if (locStr) {
                try {
                    const parsed = JSON.parse(locStr);
                    dispatch(fetchProductsNearYou(parsed));
                } catch(e) {}
            }
        }
        
        const jwt = localStorage.getItem("jwt") || auth.jwt;
        if (jwt) {
            dispatch(fetchFollowedSellerProducts());
        }
    }, [dispatch, auth.jwt, products.locationFilter]);

    const handleShowChatBot = () => {
        setShowChatBot(!showChatBot)
    }
    const handleCloseChatBot = () => {
        setShowChatBot(false)
    }
    const becomeSellerClick = () => {
        navigate("/become-seller")
    }
    return (
        <>
            {(!homePage.loading) ? <div className='bg-[#F1F3F6] min-h-screen pb-10 relative'>
                <div className="max-w-[1400px] mx-auto px-2 space-y-4">
                    {/* Top Brands Grid */}
                    {homePage.homePageData?.grid && homePage.homePageData.grid.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <TopBrand />
                        </section>
                    )}

                    {/* Deals Slider */}
                    {homePage.homePageData?.deals && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="pb-4 border-b border-gray-100 mb-4">
                                <h2 className='text-xl font-semibold text-gray-800'>Best of Deals</h2>
                            </div>
                            <DealSlider />
                        </section>
                    )}

                    {/* Products Near You */}
                    {products.productsNearYou && products.productsNearYou.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="flex items-center pb-4 border-b border-gray-100 mb-4 gap-2">
                                <LocationOnIcon sx={{ color: '#FF5A00' }} />
                                <h2 className='text-xl font-semibold text-gray-800'>Products Near You</h2>
                            </div>
                            <ProductSlider products={products.productsNearYou} />
                        </section>
                    )}

                    {/* Curated Collections */}
                    {/* <section className="bg-white p-4 shadow-sm rounded-sm">
                        <div className="flex items-center pb-4 border-b border-gray-100 mb-4 gap-2">
                            <h2 className='text-xl font-semibold text-gray-800'>Curated Picks for You</h2>
                        </div>
                        <CuratedCollections />
                    </section> */}

                    {/* Recently Added Products */}
                    {products.recentlyAddedProducts && products.recentlyAddedProducts.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                <h2 className='text-xl font-semibold text-gray-800'>Recently Added Products</h2>
                            </div>
                            <ProductSlider products={products.recentlyAddedProducts} />
                        </section>
                    )}

                    {/* Top Selling Products */}
                    {products.topSellingProducts && products.topSellingProducts.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                <h2 className='text-xl font-semibold text-gray-800'>Top Rated Products</h2>
                            </div>
                            <ProductSlider products={products.topSellingProducts} />
                        </section>
                    )}

                    {/* Featured Local Sellers */}
                    {sellers.sellers && sellers.sellers.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="flex items-center pb-4 border-b border-gray-100 mb-4 gap-2">
                                <StorefrontIcon sx={{ color: '#FF5A00' }} />
                                <h2 className='text-xl font-semibold text-gray-800'>Featured Local Sellers</h2>
                            </div>
                            <FeaturedSellersSlider sellers={sellers.sellers} />
                        </section>
                    )}

                    {/* Products from Followed Sellers */}
                    {products.followedSellerProducts && products.followedSellerProducts.length > 0 && (
                        <section className="bg-white p-4 shadow-sm rounded-sm">
                            <div className="pb-4 border-b border-gray-100 mb-4">
                                <h2 className='text-xl font-semibold text-gray-800'>Products from Sellers You Follow</h2>
                            </div>
                            <ProductSlider products={products.followedSellerProducts} />
                        </section>
                    )}

                    {/* Become Seller Banner */}
                    <section className='relative h-[250px] lg:h-[350px] object-cover rounded-sm overflow-hidden shadow-sm mt-4'>
                        <img className='w-full h-full object-cover' src={"/seller_banner_image.jpg"} alt="Become a seller" />
                        <div className='absolute inset-0 bg-black/40 flex flex-col justify-center px-8 lg:px-[10rem]'>
                            <h1 className="text-white font-bold text-3xl lg:text-5xl mb-2">Sell Your Product</h1>
                            <p className='text-white text-lg lg:text-2xl mb-6'>With <strong className='text-[#ffe500]'>Near Look</strong></p>
                            <div>
                                <Button
                                    onClick={becomeSellerClick}
                                    startIcon={<StorefrontIcon />}
                                    variant="contained"
                                    size="large"
                                    sx={{ bgcolor: '#FF5A00', '&:hover': {bgcolor: '#E64D00'}, fontWeight: 'bold' }}
                                >
                                    Become Seller
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                <section className='fixed bottom-[76px] lg:bottom-10 right-4 lg:right-10 z-[999]'>
                    {showChatBot ? <ChatBot handleClose={handleCloseChatBot} /> : <Button onClick={handleShowChatBot} sx={{ borderRadius: "2rem", bgcolor: '#FF5A00', '&:hover': {bgcolor: '#E64D00'}, minWidth: 0, padding: 0 }} variant='contained' className='h-14 w-14 lg:h-16 lg:w-16 flex justify-center items-center shadow-lg'>
                        <ChatBubbleIcon sx={{ color: "white", fontSize: { xs: "1.5rem", lg: "2rem" } }} />
                    </Button>}
                </section>
            </div> : <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CustomLoader color="inherit" />
            </Backdrop>}
        </>
    )
}

export default Home;