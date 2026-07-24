// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Account\UserAddressCard.tsx
import type { Address } from '../../../types/addressTypes'

const UserAddressCard = ({item, onEdit, onDelete}:{item: Address, onEdit: (address: Address) => void, onDelete: (addressId: string) => void}) => {
  return (
    <div className='p-5 md:p-6 border border-gray-100 rounded-2xl bg-white hover:shadow-md transition-shadow relative overflow-hidden'>
      <div className='space-y-3 text-[14px] text-gray-600'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 pb-2 border-b border-gray-50'>
          <h1 className='font-bold text-[16px] text-gray-900'>{item.name}</h1>
          <span className='font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-[12px] w-fit'>{item.mobile}</span>
        </div>
        <p className='text-gray-600 leading-relaxed pt-2 text-[15px]'>
            {item.address}, {item.locality}, {item.city}, {item.state} - <span className='font-bold text-gray-900'>{item.pinCode}</span>
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex gap-4 justify-end">
        <button 
          onClick={() => onEdit(item)}
          className="font-semibold text-gray-500 hover:text-[#FF5A00] text-[13px] tracking-wide transition-colors uppercase"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(item._id)}
          className="font-semibold text-red-400 hover:text-red-600 text-[13px] tracking-wide transition-colors uppercase"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default UserAddressCard