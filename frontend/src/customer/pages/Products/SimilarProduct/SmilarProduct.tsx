// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Products\SimilarProduct\SmilarProduct.tsx
import ProductCard from "../ProductCard/ProductCard";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../redux/Store";
import { useEffect } from "react";
import { getAllProducts } from "../../../../redux/Customer/ProductSlice";
import { useParams } from "react-router-dom";
// ✅✅✅ ADD THESE IMPORTS:
import CustomLoader from "../../../../components/CustomLoader";
import { Typography } from "@mui/material";

const SmilarProduct = () => {
  const products = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();
  const { categoryId } = useParams();

  useEffect(() => {
    if (categoryId) {
      // ✅ Only fetch if NOT loading and NOT already loaded
      if (!products.loading && (!products.products || products.products.length === 0)) {
        dispatch(getAllProducts({ category: categoryId }));
      }
    }
  }, [categoryId, dispatch, products.loading, products.products]);

  // ✅ Safe products array getter
  const productsToRender = products.products || [];

  return (
    <div>
      {products.loading ? (
        <div className="flex justify-center py-10">
          <CustomLoader />
        </div>
      ) : productsToRender.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mt-6">
          {productsToRender
            .filter((item) => item._id)  // ✅ Filter out invalid items
            .slice(0, 6)  // ✅ Limit to 6 similar products
            .map((item) => (
              <div key={item._id} className="w-full">
                <ProductCard item={item as any} categoryId={categoryId} />
              </div>
            ))}
        </div>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          No similar products found
        </Typography>
      )}
    </div>
  );
};

export default SmilarProduct;