import React from "react";
import Skeleton from '@mui/material/Skeleton';

export default function FeaturedSellersSkeleton() {
  const dummyItems = Array.from({ length: 5 });

  return (
    <div className="py-2 px-2">
      <div className="flex overflow-hidden justify-center items-center gap-4">
        {dummyItems.map((_, index) => (
          <div key={index} className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-[20%] p-2">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] p-6 flex flex-col items-center h-full mx-2 border border-transparent">
              <Skeleton variant="circular" width={96} height={96} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" sx={{ fontSize: '1.125rem', mb: 1, height: '28px' }} />
              <Skeleton variant="text" width="50%" sx={{ fontSize: '1rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
