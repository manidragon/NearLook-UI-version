// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Home\Deals\DealCard.tsx
import { useNavigate } from 'react-router-dom';

import { secureUrl } from '../../../../util/secureUrl';

const DealCard = ({ deal }: any) => {
  const navigate = useNavigate();

  // ✅ ADD: Null safety check
  if (!deal || !deal.category) {
    return null; // Skip rendering if data is invalid
  }

  const category = deal.category;
  const discount = deal.discount || 0;

  return (
    <div 
      onClick={() => navigate(`/products/${category.categoryId || category._id}`)} 
      className='cursor-pointer group flex flex-col items-center p-2'
    >
      <div className='relative overflow-hidden w-[150px] h-[150px] lg:w-[180px] lg:h-[180px] flex items-center justify-center p-2 bg-white rounded-md'>
        <img 
          className='max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300' 
          src={secureUrl(category.image, 200) || '/placeholder.jpg'} 
          alt={category.description || 'Deal'} 
        />
      </div>
      <div className='mt-3 text-center'>
        <h3 className='font-medium text-sm text-gray-800 line-clamp-1 group-hover:text-[#FF5A00] transition-colors'>
          {category.name || category.description || 'Top Deal'}
        </h3>
        {discount > 0 && (
          <p className='text-green-700 font-bold text-[15px] pt-1'>Min. {discount}% Off</p>
        )}
        <p className='text-gray-500 text-[13px] pt-0.5'>Explore Now!</p>
      </div>
    </div>
  );
};

export default DealCard;