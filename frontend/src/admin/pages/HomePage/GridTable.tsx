import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "../../../redux/Store";
import { fetchHomeCategories } from "../../../redux/Admin/AdminSlice";
import HomeCategoryTable from "./HomeCategoryTable";

export default function GridTable() {
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin);
  
  useEffect(() => {
    dispatch(fetchHomeCategories());
  }, [dispatch]);

  const gridCategories = adminState.categories.filter(
    (cat) => cat.section === "GRID"
  );

  return (
    <HomeCategoryTable categories={gridCategories} section="GRID" />
  );
}