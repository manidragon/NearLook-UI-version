import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../Products/ProductCard/ProductCard";
import { type Product } from "../../../types/productTypes";

interface ProductSliderProps {
  products: Product[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const settings = {
    dots: false,
    infinite: products.length > 6,
    slidesToShow: 6,
    slidesToScroll: 2,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 3000,
    cssEase: "ease-in-out",
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 2,
          infinite: products.length > 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
          infinite: products.length > 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: products.length > 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: products.length > 2,
        },
      },
    ],
  };

  return (
    <div className="py-2 px-2">
      <div className="slide-container">
        <Slider {...settings}>
          {products.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-2">
              <ProductCard item={item} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
