import { useAppSelector } from "../../../../redux/Store";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { useState } from "react";

import { secureUrl } from '../../../../util/secureUrl';

const TopBrand = () => {
  const homePage = useAppSelector(state => state.homePage);
  const [progressWidth, setProgressWidth] = useState(0);
  
  // Safety check - return null if no grid data
  if (!homePage.homePageData?.grid || homePage.homePageData.grid.length === 0) {
    return null; // Don't render grid if no data
  }

  const totalSlides = homePage.homePageData.grid.length;

  const updateProgress = (swiper: any) => {
    // Update progress based on real index to handle loop correctly
    const rate = Math.min((swiper.realIndex + 1) / totalSlides, 1);
    setProgressWidth(rate * 100);
  };

  return (
    <div className="homeSlider relative py-2 lg:py-5">
      <div className="container px-0 mx-auto">
        <Swiper
          slidesPerView={1}
          loop
          spaceBetween={40}
          modules={[Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          speed={500}
          className="sliderHome"
          onInit={updateProgress}
          onSlideChange={updateProgress}
        >
          {homePage.homePageData.grid.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="
                  relative
                  w-full
                  h-[180px] sm:h-[240px] md:h-[300px] lg:h-[510px]
                  rounded-[10px]
                  overflow-hidden
                "
              >
                <img
                  src={secureUrl(item.image)}
                  alt={item.description || `Banner ${index + 1}`}
                  title={item.description || `Banner ${index + 1}`}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                    object-center
                  "
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Progress Bar matching requested style */}
        <div className="bg-[#ccc] mt-4">
          <div 
            className="bg-[#FF5A00] h-[2px] transition-[width] duration-400 ease"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopBrand;