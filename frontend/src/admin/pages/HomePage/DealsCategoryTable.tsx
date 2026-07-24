// D:\Mani\Code with Zosh\Backup\source code\frontend\src\admin\pages\HomePage\DealsCategoryTable.tsx

import { useAppSelector } from "../../../redux/Store";
import HomeCategoryTable from "./HomeCategoryTable";

function DealsCategoryTable() {
  const adminState = useAppSelector((state) => state.admin);

  return (
    <>
      <HomeCategoryTable categories={adminState.categories.filter((c) => c.section === "DEALS")} section="DEALS" />
    </>
  );
}

export default DealsCategoryTable