// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Home\Home.tsx
import { useState, useEffect } from 'react'
import TopBrand from './TopBrands/Grid'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Button from "../../../components/NeonButton";
import CustomLoader from "../../../components/CustomLoader";
import React, { Suspense } from 'react';
import { Backdrop } from "@mui/material"
const ChatBot = React.lazy(() => import('../ChatBot/ChatBot'));
import { useNavigate } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAppSelector, useAppDispatch } from '../../../redux/Store'
import { fetchCategories } from '../../../redux/Admin/CategorySlice';
import { fetchFollowedSellerProducts, fetchRecentlyAddedProducts, fetchTopSellingProducts, fetchProductsNearYou } from '../../../redux/Customer/ProductSlice';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { fetchSellers } from '../../../redux/Seller/sellerSlice';
import ProductSliderSkeleton from './ProductSliderSkeleton';
import FeaturedSellersSkeleton from './FeaturedSellersSkeleton';


const ProductSlider = React.lazy(() => import('./ProductSlider'));
const FeaturedSellersSlider = React.lazy(() => import('./FeaturedSellersSlider'));

const LazySection = ({ children, height = "400px" }: { children: React.ReactNode, height?: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: "200px" });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} style={{ minHeight: isVisible ? 'auto' : height }}>{isVisible && children}</div>;
}

const Home = () => {
    const [showChatBot, setShowChatBot] = useState(false)
    const [isInitialRender, setIsInitialRender] = useState(true);
    const products = useAppSelector(state => state.products);
    const auth = useAppSelector(state => state.auth);
    const homePage = useAppSelector(state => state.homePage);
    const sellers = useAppSelector(state => state.sellers);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Legacy effect removed for LazySection
    }, [isInitialRender, products.loading]);

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
        setIsInitialRender(false);
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
            <div className='bg-[#F1F3F6] min-h-screen pb-10 relative'>
                <div className="max-w-[1400px] mx-auto px-2 space-y-4">
                    {/* Top Brands Grid */}
                    <section className="bg-white p-4 shadow-sm rounded-sm">
                        <TopBrand />
                    </section>


                    <div className="min-h-[100vh] space-y-4">

                        {/* 2. Recently Added Products (Guaranteed data, gets Skeleton) */}
                        <LazySection height="300px">
                            <section className="bg-white p-4 shadow-sm rounded-sm">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                    <h2 className='text-xl font-semibold text-gray-800'>Recently Added Products</h2>
                                </div>
                                {(!products.recentlyAddedProducts || products.recentlyAddedProducts.length === 0) ? <ProductSliderSkeleton /> : (
                                    <Suspense fallback={<ProductSliderSkeleton />}>
                                        <ProductSlider products={products.recentlyAddedProducts} />
                                    </Suspense>
                                )}
                            </section>
                        </LazySection>

                        {/* 3. Top Rated Products (Guaranteed data, gets Skeleton) */}
                        <LazySection height="300px">
                            <section className="bg-white p-4 shadow-sm rounded-sm">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                    <h2 className='text-xl font-semibold text-gray-800'>Top Rated Products</h2>
                                </div>
                                {(!products.topSellingProducts || products.topSellingProducts.length === 0) ? <ProductSliderSkeleton /> : (
                                    <Suspense fallback={<ProductSliderSkeleton />}>
                                        <ProductSlider products={products.topSellingProducts} />
                                    </Suspense>
                                )}
                            </section>
                        </LazySection>

                        {/* 5. Featured Local Sellers (Data fetched, gets Skeleton) */}
                        <LazySection height="300px">
                            <section className="bg-white p-4 shadow-sm rounded-sm">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                    <h2 className='text-xl font-semibold text-gray-800'>Featured Local Sellers <StorefrontIcon className="text-primary-color" /></h2>
                                </div>
                                {(!sellers.sellers || sellers.sellers.length === 0) ? <FeaturedSellersSkeleton /> : (
                                    <Suspense fallback={<FeaturedSellersSkeleton />}>
                                        <FeaturedSellersSlider sellers={sellers.sellers} />
                                    </Suspense>
                                )}
                            </section>
                        </LazySection>

                        {/* 3. Products Near You (Dynamic, NO skeleton, pops in off-screen) */}
                        <LazySection height="400px">
                            {products.productsNearYou && products.productsNearYou.length > 0 && (
                                <section className="bg-white p-4 shadow-sm rounded-sm">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                                        <h2 className='text-xl font-semibold text-gray-800'>Products Near You <LocationOnIcon className="text-primary-color" /></h2>
                                    </div>
                                    <Suspense fallback={<ProductSliderSkeleton />}>
                                        <ProductSlider products={products.productsNearYou} />
                                    </Suspense>
                                </section>
                            )}
                        </LazySection>

                        {/* 5. Products from Followed Sellers (Dynamic, NO skeleton, pops in off-screen) */}
                        <LazySection height="400px">
                            {products.followedSellerProducts && products.followedSellerProducts.length > 0 && (
                                <section className="bg-white p-4 shadow-sm rounded-sm">
                                    <div className="pb-4 border-b border-gray-100 mb-4">
                                        <h2 className='text-xl font-semibold text-gray-800'>Products from Sellers You Follow</h2>
                                    </div>
                                    <Suspense fallback={<ProductSliderSkeleton />}>
                                        <ProductSlider products={products.followedSellerProducts} />
                                    </Suspense>
                                </section>
                            )}
                        </LazySection>
                    </div>
                </div>

                <section className='fixed bottom-[76px] lg:bottom-10 right-4 lg:right-10 z-[999]'>
                    {showChatBot ? (
                        <Suspense fallback={<div className="h-[500px] w-[400px] flex justify-center items-center bg-white rounded-2xl shadow-2xl border border-gray-200">Loading Assistant...</div>}>
                            <ChatBot handleClose={handleCloseChatBot} />
                        </Suspense>
                    ) : (
                        <Button aria-label="Open chat assistant" onClick={handleShowChatBot} sx={{ borderRadius: "2rem", bgcolor: '#FF5A00', '&:hover': {bgcolor: '#E64D00'}, minWidth: 0, padding: 0 }} variant='contained' className='h-14 w-14 lg:h-16 lg:w-16 flex justify-center items-center shadow-lg'>
                            <ChatBubbleIcon sx={{ color: "white", fontSize: { xs: "1.5rem", lg: "2rem" } }} />
                        </Button>
                    )}
                </section>
            </div>
        </>
    )
}

export default Home;