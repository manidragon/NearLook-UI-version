// D:\Mani\Code with Zosh\UI version\source code\frontend\src\customer\pages\Products\ProductDetails\components\ProductReviewsTab.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductReviewCard from '../../../Review/ProductReviewCard';
import RatingCard from '../../../Review/RatingCard';
import { FaStar, FaPenSquare } from "react-icons/fa";
import '../../../Review/Review.css';

interface ProductReviewsTabProps {
  review: any; // review slice state
  productId: string | undefined;
}

const ProductReviewsTab: React.FC<ProductReviewsTabProps> = ({ review, productId }) => {
  const navigate = useNavigate();
  const reviewsList = review.reviews || [];

  return (
    <div className="max-w-full overflow-hidden box-border">
      <div className="blk__head blk__head--row flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
          <p className="text-gray-500 text-sm mt-1">
            Ratings and reviews from verified buyers.
          </p>
        </div>

      </div>

      <div className="revGrid">
        {/* Left: breakdown */}
        <aside className="side">
          {/* We assume RatingCard will be styled with the VeriVibe classes */}
          <RatingCard reviews={reviewsList} />
        </aside>

        {/* Right: list */}
        <section className="list">
          <div className="list__top flex justify-between items-center mb-4">
            <div className="list__stats">
              <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                <span>{reviewsList.length}</span> shown
              </span>
            </div>
          </div>

          <div className="reviewList flex flex-col gap-6">
            {reviewsList.length > 0 ? (
              reviewsList
                .slice()
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <ProductReviewCard key={index} item={item} />
                ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>

          {reviewsList.length > 0 && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate(`/reviews/${productId}`)}
                className="px-6 py-2.5 border border-orange-600 text-orange-600 font-medium rounded-full hover:bg-orange-50 transition"
              >
                View All {reviewsList.length} Reviews
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductReviewsTab;
