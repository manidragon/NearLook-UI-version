// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Products.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../Products/ProductCard/ProductCard";

export default function Products({ seller }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!seller?._id) return;

    fetch(`http://localhost:8080/sellers/${seller._id}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [seller]);


  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const featuredProducts = filteredProducts.filter(p => p.isFeatured);
  const regularProducts = filteredProducts.filter(p => !p.isFeatured);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8" id="products">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-[#FF5A00]">🛍</span> Store Products
        </h2>

        <div className="relative w-full md:w-[350px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search this store..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 focus:border-[#FF5A00] transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A00]"></div>
        </div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: seller?.storefront?.themeColor || "#FF5A00" }}>
                ⭐ Featured
              </h3>
              <div className="sp-products-grid">
                {featuredProducts.map((product: any) => (
                  <ProductCard 
                    key={product._id} 
                    item={product} 
                    categoryId={product.category?._id || product.category || product.categoryId || "unknown"}
                    sellerId={seller._id}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="sp-products-grid">
            {regularProducts.length > 0 ? (
              regularProducts.map((product: any) => (
                <ProductCard 
                  key={product._id} 
                  item={product} 
                  categoryId={product.category?._id || product.category || product.categoryId || "unknown"}
                  sellerId={seller._id}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">No products found in this store.</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );


}