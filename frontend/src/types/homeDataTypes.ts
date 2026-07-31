// ✅ KEEP EXISTING HomeCategorySection const
export const HomeCategorySection = {
  GRID: "GRID",
  SHOP_BY_CATEGORIES: "SHOP_BY_CATEGORIES",
  ELECTRIC_CATEGORIES: "ELECTRIC_CATEGORIES",
  DEALS: "DEALS"
} as const;

export type HomeCategorySectionType = typeof HomeCategorySection[keyof typeof HomeCategorySection];



// ✅ KEEP EXISTING HomeCategory (for GRID, SHOP_BY_CATEGORIES, DEALS)
export interface HomeCategory {
  _id?: string;
  categoryId?: string;
  name?: string;
  image: string;
  description: string;
  section: string;
}

interface Deal {
  category: HomeCategory;
  discount: number;
}

export interface HomeData {
  _id: string; 
  grid: HomeCategory[]; 
  shopByCategories: HomeCategory[]; 

  deals: Deal[]; 
  dealCategories: HomeCategory[];
}