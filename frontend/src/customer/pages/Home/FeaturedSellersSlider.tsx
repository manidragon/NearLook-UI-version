import React, { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { type Seller } from "../../../types/sellerTypes";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchSellerReviews } from "../../../redux/Customer/SellerReviewSlice";
import { secureUrl } from "../../../util/secureUrl";
interface FeaturedSellersSliderProps {
  sellers: Seller[];
}

export default function FeaturedSellersSlider({ sellers }: FeaturedSellersSliderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sellerReviewState = useAppSelector((state) => state.sellerReview);

  if (!sellers || sellers.length === 0) {
    return null;
  }

  useEffect(() => {
    sellers.forEach(seller => {
      if (seller._id) {
        dispatch(fetchSellerReviews({ sellerId: seller._id }));
      }
    });
  }, [dispatch, sellers]);

  const settings = {
    dots: false,
    infinite: sellers.length > 5,
    slidesToShow: 5,
    slidesToScroll: 2,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 3500,
    cssEase: "ease-in-out",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
          infinite: sellers.length > 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: sellers.length > 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: sellers.length > 2,
        },
      },
    ],
  };

  return (
    <div className="py-2 px-2">
      <div className="slide-container">
        <Slider {...settings}>
          {sellers.map((seller, index) => {
            const realReviewCount = sellerReviewState.reviewsBySeller[seller._id]?.length;
            const displayReviewCount = realReviewCount !== undefined ? realReviewCount : (seller?.totalReviews || 0);
            
            return (
            <div key={index} className="flex flex-col items-center justify-center p-2">
              <div 
                onClick={() => navigate(`/seller-profile/${seller._id}`)}
                className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(255,90,0,0.15)] transition-all duration-300 p-6 flex flex-col items-center cursor-pointer border border-transparent hover:border-orange-100 h-full mx-2"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 p-1 mb-4">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {seller.businessDetails?.logo ? (
                      <img src={secureUrl(seller.businessDetails.logo)} alt={seller.businessDetails.businessName || "Seller"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-orange-500">
                        {seller.businessDetails?.businessName?.charAt(0)?.toUpperCase() || "S"}
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg text-center mb-1 line-clamp-1">
                  {seller.businessDetails?.businessName || "Local Seller"}
                </h3>
                <div className="text-orange-500 text-sm font-semibold flex items-center justify-center gap-1">
                  <span>⭐</span> {seller.averageRating ? seller.averageRating.toFixed(1) : "New"} 
                  {displayReviewCount > 0 ? <span className="text-gray-500 text-xs ml-1">({displayReviewCount})</span> : null}
                </div>
              </div>
            </div>
          )})}
        </Slider>
      </div>
    </div>
  );
}
