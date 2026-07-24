import { IconButton } from "@mui/material";
import type { Review } from "../../../types/reviewTypes";
import DeleteIcon from '@mui/icons-material/Delete';
import { red } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { deleteReview } from "../../../redux/Customer/ReviewSlice";
import { deleteSellerReview } from "../../../redux/Customer/SellerReviewSlice";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle } from "react-icons/fa";
import './Review.css';

interface ProductReviewCardProps {
  item: Review;
}

const ProductReviewCard = ({ item }: ProductReviewCardProps) => {
  const { user } = useAppSelector(store => store.user);
  const dispatch = useAppDispatch();

  const handleDeleteReview = () => {
    if ((item as any).seller) {
      dispatch(deleteSellerReview({ reviewId: item._id, sellerId: (item as any).seller, jwt: localStorage.getItem("jwt") || "" }));
    } else {
      dispatch(deleteReview({ reviewId: item._id, jwt: localStorage.getItem("jwt") || "" }));
    }
  };

  // Helper to render stars safely
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    return stars;
  };

  const initial = item.user?.fullName ? item.user.fullName[0].toUpperCase() : "U";

  return (
    <article className="revCard">
      <div className="revCard__head">
        <div className="revCard__user">
          <div className="revCard__avatar">
            {initial}
          </div>
          <div>
            <div className="revCard__name">
              {item.user?.fullName}
              <span className="revCard__badge">
                <FaCheckCircle size={12} /> Verified
              </span>
            </div>
            <div className="revCard__date">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="revCard__meta">
          <div className="revCard__rating" aria-label={`Rating: ${item.rating} stars`}>
            {renderStars(item.rating || 0)}
          </div>
        </div>
      </div>

      <div className="revCard__content">
        <p>{item.reviewText}</p>
      </div>

      {((item.productImages && item.productImages.length > 0) || ((item as any).images && (item as any).images.length > 0)) && (
        <div className="revCard__images">
          {(item.productImages || (item as any).images).map((image: string, idx: number) => (
            <img key={idx} className="revCard__img" src={image} alt="Review attachment" loading="lazy" />
          ))}
        </div>
      )}

      {item.user?._id === user?._id && (
        <div className="revCard__actions">
          <IconButton onClick={handleDeleteReview} aria-label="delete review" size="small">
            <DeleteIcon sx={{ color: red[700] }} fontSize="small" />
          </IconButton>
        </div>
      )}
    </article>
  );
};

export default ProductReviewCard;
