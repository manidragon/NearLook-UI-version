// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Home\HomeCategory\HomeCategory.tsx
import HomeCategoryCard from './HomeCategoryCard'
import { useAppSelector } from '../../../../redux/Store';


const HomeCategory = () => {
  const homePage = useAppSelector((state) => state.homePage);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {homePage.homePageData?.shopByCategories.map((item) => (
        <HomeCategoryCard
          key={item._id }
          item={item}
        />
      ))}
    </div>
  )
}

export default HomeCategory