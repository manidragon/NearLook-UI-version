import { Divider, useTheme, useMediaQuery } from '@mui/material'

const ProfileFildCard = ({value, keys}: any) => {
  return (
    <div className='p-2 sm:p-4 my-2 flex flex-col xl:flex-row xl:items-center bg-[#f8fafc] border border-slate-100 rounded-xl hover:shadow-sm hover:bg-white transition-all duration-300'>
      <p className='text-xs sm:text-sm text-gray-500 font-medium xl:w-36 mb-1 xl:mb-0 xl:pr-4 uppercase tracking-wider'>{keys}</p>
      <div className='hidden xl:flex items-center'>
        <Divider orientation="vertical" flexItem sx={{ mr: 3, minHeight: '24px' }} />
      </div>
      <div className='font-semibold text-gray-800 text-sm sm:text-base flex-1 break-words break-all mt-1 xl:mt-0'>
        {value}
      </div>
    </div>
  )
}

export default ProfileFildCard