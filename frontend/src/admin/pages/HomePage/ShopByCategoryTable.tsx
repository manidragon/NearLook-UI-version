// D:\Mani\Code with Zosh\Backup\source code\frontend\src\admin\pages\HomePage\ShopByCategoryTable.tsx
import React from 'react'
import HomeCategoryCard from '../../../customer/pages/Home/HomeCategory/HomeCategoryCard'
import HomeCategoryTable from './HomeCategoryTable'
import { useAppSelector } from '../../../redux/Store';

const ShopByCategoryTable = () => {
    const homePage = useAppSelector((state) => state.homePage);
  return (
    <HomeCategoryTable categories={homePage.homePageData?.shopByCategories} section="SHOP_BY_CATEGORY" />
  )
}

export default ShopByCategoryTable