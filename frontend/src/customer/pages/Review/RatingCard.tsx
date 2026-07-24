// D:\Mani\Code with Zosh\UI version\source code\frontend\src\customer\pages\Review\RatingCard.tsx
import React from 'react';
import { FaStar, FaStarHalf, FaRegStar, FaChartSimple, FaCircleCheck, FaWandMagicSparkles } from "react-icons/fa6";
import './Review.css';

interface RatingCardProps {
  reviews: any[];
}

const RatingCard: React.FC<RatingCardProps> = ({ reviews = [] }) => {
  const totalReviews = reviews.length;
  
  // Calculate stats
  const stats = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const totalStars = reviews.reduce((sum, item) => sum + (item.rating || 0), 0);
  const averageRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalf key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    return stars;
  };

  return (
    <div className="card">
      <div className="card__head">
        <div className="card__title">
          <FaChartSimple />
          <span>Rating breakdown</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
          <FaCircleCheck />
          <span>Verified</span>
        </span>
      </div>

      <div className="score">
        <div className="score__big">
          <div className="score__num">{averageRating > 0 ? averageRating.toFixed(1) : '0'}</div>
          <div className="flex gap-0.5 text-orange-400 mt-1 text-sm" aria-label="Average stars">
            {renderStars(averageRating)}
          </div>
        </div>
        <div className="score__meta">
          <div className="muted">
            <span>{totalReviews}</span> total reviews
          </div>
          <div className="muted flex items-center gap-1 mt-1">
            <FaWandMagicSparkles className="text-orange-500" />
            <span>Confidence: {totalReviews > 10 ? 'High' : 'Moderate'}</span>
          </div>
        </div>
      </div>

      <div className="bars">
        {stats.map(({ rating, count, percentage }) => (
          <div className="barRow" key={rating}>
            <span className="barRow__lbl">{rating}★</span>
            <div className="barRow__track">
              <div 
                className="barRow__fill" 
                style={{ width: `${percentage}%`, background: rating > 3 ? 'var(--success)' : rating === 3 ? 'var(--c)' : 'var(--danger)' }}
              ></div>
            </div>
            <span className="barRow__pct">{percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>

      <div className="sep"></div>

      <div className="flex flex-wrap gap-2">
        {[5, 4, 3, 2, 1].map(r => (
          <button key={r} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition" type="button">
            <span>{r}★</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingCard;