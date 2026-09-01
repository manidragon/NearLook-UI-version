// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Home\HomeCategory\HomeCategoryCard.tsx
import "./HomeCategoryCard.css"
import { useNavigate } from 'react-router-dom'
import { secureUrl } from '../../../../util/secureUrl';
const HomeCategoryCard = ({item}:any) => {
  const navigate=useNavigate()
  return (
    <div 
      onClick={() => navigate(`/products/${item.categoryId}`)} 
      className='flex flex-col items-center justify-center p-4 bg-[#f8f8f8] rounded-md hover:shadow-md transition-all cursor-pointer group'
    >
      <div className='w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] overflow-hidden flex items-center justify-center'>
        <img className='group-hover:scale-110 transition-transform duration-500 object-contain h-full w-full mix-blend-multiply' src={secureUrl(item.image, 150)} alt={item.name} />
      </div>
      <h1 className='font-semibold text-gray-800 mt-4 text-center text-[14px] group-hover:text-[#FF5A00] transition-colors line-clamp-1'>{item.name}</h1>
    </div>
  )
}

export default HomeCategoryCard