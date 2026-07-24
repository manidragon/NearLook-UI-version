// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Checkout\AddressCard.tsx
import { Radio } from '@mui/material';
import React from 'react';
import type { Address } from '../../../types/addressTypes';

interface AddressCardProps {
    item: Address;
    selectedAddressId: string | null;
    onAddressSelect: (addressId: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ item, selectedAddressId, onAddressSelect }) => {
    return (
        <div 
            className={`p-4 md:p-6 border rounded-2xl flex items-start gap-2 cursor-pointer transition-all ${
                selectedAddressId === item._id 
                    ? 'border-[#FF5A00] bg-orange-50/40 shadow-[0_4px_12px_rgba(255,90,0,0.1)]' 
                    : 'border-gray-100 bg-white hover:border-[#FF5A00]/50 hover:shadow-md'
            }`}
            onClick={() => onAddressSelect(item._id)}
        >
            <div className="mt-[-2px]">
                <Radio
                    checked={selectedAddressId === item._id}
                    onChange={() => onAddressSelect(item._id)}
                    value={item._id}
                    name="address-selection"
                    sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#FF5A00' } }}
                    inputProps={{ 'aria-label': item.name }}
                />
            </div>

            <div className='space-y-2 flex-1 text-[14px]'>
                <h1 className='font-bold text-[16px] text-gray-800 tracking-tight'>{item.name}</h1>
                <p className='text-gray-500 leading-relaxed text-sm'>
                    {item.address}, {item.locality}, {item.city}, {item.state} - <span className='font-semibold text-gray-800'>{item.pinCode}</span>
                </p>
                <div className='flex items-center gap-2 pt-1'>
                    <i className="fa-solid fa-phone text-gray-400 text-xs"></i>
                    <p className='text-gray-700 font-medium text-sm'>{item.mobile}</p>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;