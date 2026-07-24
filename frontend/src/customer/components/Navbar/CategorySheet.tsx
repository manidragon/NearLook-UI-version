// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\components\Navbar\CategorySheet.tsx
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchCategories } from "../../../redux/Admin/CategorySlice";
import type { Category } from "../../../types/categoryTypes";

interface CategorySheetProps {
  selectedCategory: string;
  toggleDrawer?: () => void;
  setShowSheet?: (show: boolean) => void;
}

const CategorySheet = ({
  selectedCategory,
  toggleDrawer,
  setShowSheet,
}: CategorySheetProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categoryState = useAppSelector((state) => state.category);
  const { categories, loading } = categoryState;

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // ✅ Level 2: SORT by ORDER field (Preserves admin-set order)
  const getLevelTwoCategories = () => {
    return categories
      .filter(
        (cat) => cat.level === 2 && cat.parentCategory === selectedCategory
      )
      .sort((a, b) => {
        // ✅ Primary sort by order field
        const orderA = a.order || 999999;
        const orderB = b.order || 999999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // ✅ Secondary sort by name (for same order values)
        return (a.name || '').localeCompare(b.name || '');
      });
  };

  // ✅ Level 3: SORTED ALPHABETICALLY (unchanged)
  const getLevelThreeCategories = (parentCategoryId: string) => {
    return categories
      .filter(
        (cat) => cat.level === 3 && cat.parentCategory === parentCategoryId
      )
      .sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (toggleDrawer) {
      toggleDrawer();
    }
    if (setShowSheet) {
      setShowSheet(false);
    }
    navigate(`/products/${categoryId}`);
  };

  const levelTwoCategories = getLevelTwoCategories();

  return (
    <Box className="bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[85vh] lg:max-h-[70vh] rounded-b-2xl border-t border-gray-100 w-full">
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8 p-6 lg:p-10 custom-scrollbar">
          {levelTwoCategories.map((levelTwoCat) => (
            <div key={levelTwoCat._id} className="flex flex-col w-full">
              <p className="text-[#1e293b] text-base lg:text-lg font-bold mb-3 pb-2 border-b border-gray-100 tracking-wide">
                {levelTwoCat.name}
              </p>

              <ul className="space-y-3 mt-1">
                {getLevelThreeCategories(levelTwoCat._id).map(
                  (levelThreeCat) => (
                    <li key={levelThreeCat._id}>
                      <span
                        onClick={() => handleCategoryClick(levelThreeCat._id)}
                        className="text-gray-500 text-sm md:text-base font-medium hover:text-[#FF5A00] cursor-pointer transition-all duration-200 inline-block hover:translate-x-1"
                      >
                        {levelThreeCat.name}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default CategorySheet;