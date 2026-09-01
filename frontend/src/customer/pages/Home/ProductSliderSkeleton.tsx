import React from "react";
import Skeleton from '@mui/material/Skeleton';

export default function ProductSliderSkeleton() {
  const dummyItems = Array.from({ length: 6 });

  return (
    <div className="py-2 px-2">
      <div className="flex overflow-hidden gap-4">
        {dummyItems.map((_, index) => (
          <div key={index} className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-[16.666%] px-2">
            <div className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden h-full">
              <div className="relative w-full pt-[100%] sm:pt-[120%] bg-gray-50 flex-shrink-0 overflow-hidden">
                <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              </div>
              
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <Skeleton variant="text" sx={{ fontSize: '1rem', minHeight: '2.5rem', mb: 1 }} />
                
                <Skeleton variant="rectangular" width={50} height={20} sx={{ mt: 1, mb: 3, borderRadius: '6px' }} />
                
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex flex-col gap-1 w-1/2">
                    <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '80%' }} />
                  </div>
                  <Skeleton variant="circular" width={40} height={40} sx={{ display: { xs: 'none', sm: 'block' } }} />
                  <Skeleton variant="circular" width={32} height={32} sx={{ display: { xs: 'block', sm: 'none' } }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
