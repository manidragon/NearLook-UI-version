// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\components\Navbar\CategorySheet.tsx
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
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

  const [hoveredLevelTwoId, setHoveredLevelTwoId] = useState<string | null>(null);

  const levelTwoCategories = getLevelTwoCategories();
  const activeLevelTwoId = hoveredLevelTwoId && levelTwoCategories.some(c => c._id === hoveredLevelTwoId)
    ? hoveredLevelTwoId
    : levelTwoCategories[0]?._id;

  const activeLevelThreeCategories = activeLevelTwoId ? getLevelThreeCategories(activeLevelTwoId) : [];

  return (
    <Box className="bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[85vh] lg:max-h-[70vh] rounded-b-2xl border-t border-gray-100 w-full">
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading categories...</div>
      ) : (
        <div className="flex flex-col lg:flex-row p-0 min-h-[400px]">
          {/* Left Section (20%) - Level 2 Categories */}
          <div className="w-full lg:w-[20%] bg-gray-50/80 border-r border-gray-100 p-6 lg:p-8">
            <h3 className="text-[#1e293b] font-bold mb-4 text-lg border-b border-gray-200 pb-2">Categories</h3>
            <ul className="space-y-1">
              {levelTwoCategories.map((cat) => (
                <li key={cat._id}>
                  <button
                    onMouseEnter={() => setHoveredLevelTwoId(cat._id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      activeLevelTwoId === cat._id 
                        ? 'bg-white text-[#FF5A00] shadow-sm border border-orange-100' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Section (80%) - Level 3 Categories */}
          <div className="w-full lg:w-[80%] p-6 lg:p-10 bg-white">
            <h3 className="text-[#1e293b] font-bold mb-6 text-xl">
              {levelTwoCategories.find(c => c._id === activeLevelTwoId)?.name}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              {activeLevelThreeCategories.length > 0 ? (
                activeLevelThreeCategories.map((cat) => (
                  <div key={cat._id}>
                    <span
                      onClick={() => handleCategoryClick(cat._id)}
                      className="text-gray-500 text-sm md:text-base font-medium hover:text-[#FF5A00] cursor-pointer transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      {cat.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No subcategories available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default CategorySheet;