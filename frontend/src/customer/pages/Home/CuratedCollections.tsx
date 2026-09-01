import React from 'react';
import { useNavigate } from 'react-router-dom';
import { secureUrl } from '../../../util/secureUrl';

const collections = [
  {
    id: 1,
    title: "Summer Essentials",
    subtitle: "Up to 50% Off",
    imageUrl: "http://res.cloudinary.com/dt6nu9oqs/image/upload/v1771650479/ifbkbaxqwke2xr2b5ti1.webp",
    link: "/products/summer"
  },
  {
    id: 2,
    title: "New Arrivals in Tech",
    subtitle: "Latest Gadgets",
    imageUrl: "http://res.cloudinary.com/dt6nu9oqs/image/upload/v1771650498/zyjvaerbyl4adkvxgvv8.webp",
    link: "/products/tech"
  },
  {
    id: 3,
    title: "Home Decor",
    subtitle: "Refresh Your Space",
    imageUrl: "http://res.cloudinary.com/dt6nu9oqs/image/upload/v1771593936/cl6azoemobcx3wuxuoke.webp",
    link: "/products/home"
  }
];

export default function CuratedCollections() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Large item taking full height on desktop */}
      <div 
        onClick={() => navigate(collections[0].link)}
        className="relative group rounded-xl overflow-hidden shadow-sm cursor-pointer h-[250px] md:h-[400px]"
      >
        <img 
          src={secureUrl(collections[0].imageUrl, 800)} 
          alt={collections[0].title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-2xl font-bold mb-1">{collections[0].title}</h3>
          <p className="text-white/80 font-medium">{collections[0].subtitle}</p>
        </div>
      </div>

      {/* Two smaller items stacked vertically */}
      <div className="flex flex-col gap-4 h-[250px] md:h-[400px]">
        {collections.slice(1).map((collection, index) => (
          <div 
            key={index}
            onClick={() => navigate(collection.link)}
            className="relative group rounded-xl overflow-hidden shadow-sm cursor-pointer flex-1"
          >
            <img 
              src={secureUrl(collection.imageUrl, 500)} 
              alt={collection.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
              <h3 className="text-white text-xl font-bold mb-1">{collection.title}</h3>
              <p className="text-white/80 font-medium text-sm">{collection.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
