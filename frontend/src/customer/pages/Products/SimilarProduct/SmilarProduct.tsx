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
import ProductSlider from "../../Home/ProductSlider";

const SmilarProduct = () => {
  const products = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();
  const { categoryId } = useParams();

  const trueCategoryId = (categoryId && categoryId !== 'undefined') 
    ? categoryId 
    : (products.product?.category?.categoryId || products.product?.category?._id);

  useEffect(() => {
    if (trueCategoryId) {
      dispatch(getAllProducts({ category: trueCategoryId }));
    }
  }, [trueCategoryId, dispatch]);

  // ✅ Safe products array getter
  const productsToRender = products.products || [];

  const filteredProducts = productsToRender.filter((item) => item._id && item._id !== products.product?._id).slice(0, 15);

  if (!products.loading && filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto pt-10 px-4 sm:px-10 lg:px-20 mb-10">
      <h2 className="text-xl font-bold mb-4">Similar Products</h2>
      {products.loading ? (
        <div className="flex justify-center items-center py-10 min-h-[400px]">
          <CustomLoader />
        </div>
      ) : (
        <div className="mt-6">
          <ProductSlider products={filteredProducts as any} />
        </div>
      )}
    </section>
  );
};

export default SmilarProduct;