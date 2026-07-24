// D:\Mani\Code with Zosh\Backup\source code\frontend\src\admin\pages\HomePage\ElectronicsTable.tsx
import { useAppSelector } from "../../../redux/Store";
import HomeCategoryTable from "./HomeCategoryTable";

function ElectronicsTable() {
  const homePage= useAppSelector((state) => state.homePage);

  return (
    <>
      <HomeCategoryTable categories={homePage.homePageData?.electricCategories}/>
    </>
  );
}


export default ElectronicsTable