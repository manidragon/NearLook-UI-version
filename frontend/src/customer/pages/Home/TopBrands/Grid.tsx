import { useAppSelector } from "../../../../redux/Store";
import React, { useState, useEffect } from "react";
import { secureUrl } from '../../../../util/secureUrl';

const TopBrand = () => {
  const homePage = useAppSelector(state => state.homePage);
  const [currentIndex, setCurrentIndex] = useState(0);

  const gridData = homePage.homePageData?.grid;

  useEffect(() => {
    if (!gridData || gridData.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gridData.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [gridData]);

  if (!gridData || gridData.length === 0) {
    const loadingImg = "https://res.cloudinary.com/dt6nu9oqs/image/upload/v1771593936/cl6azoemobcx3wuxuoke.webp";
    return (
      <div className="homeSlider relative py-2 lg:py-5">
        <div className="container px-0 mx-auto min-h-[180px] sm:min-h-[240px] md:min-h-[300px] lg:min-h-[510px]">
          <div className="relative w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[510px] rounded-[10px] overflow-hidden">
            <img src={secureUrl(loadingImg, 1000)} alt="Loading" fetchPriority="high" loading="eager" className="absolute inset-0 w-full h-full object-cover object-center" />
          </div>
          <div className="bg-[#ccc] mt-4"><div className="bg-[#FF5A00] h-[2px] w-0" /></div>
        </div>
      </div>
    );
  }

  const progressWidth = Math.min(((currentIndex + 1) / gridData.length) * 100, 100);

  return (
    <div className="homeSlider relative py-2 lg:py-5">
      <div className="container px-0 mx-auto min-h-[180px] sm:min-h-[240px] md:min-h-[300px] lg:min-h-[510px] overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-[180px] sm:h-[240px] md:h-[300px] lg:h-[510px]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {gridData.map((item: any, index: number) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative rounded-[10px] overflow-hidden">
              <picture>
                <source media="(max-width: 600px)" srcSet={secureUrl(item.image, 400)} />
                <source media="(max-width: 1024px)" srcSet={secureUrl(item.image, 800)} />
                <img
                  src={secureUrl(item.image, 1000)}
                  alt={item.description || `Banner ${index + 1}`}
                  title={item.description || `Banner ${index + 1}`}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  width={1000}
                  height={510}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </picture>
            </div>
          ))}
        </div>

        <div className="bg-[#ccc] mt-4">
          <div 
            className="bg-[#FF5A00] h-[2px] transition-[width] duration-300 ease"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopBrand;