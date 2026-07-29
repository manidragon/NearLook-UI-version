import React, { useEffect } from "react";
import { Box, Typography, Divider } from '@mui/material';

import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector }
from "../../../redux/Store";

import {
    fetchReviewsByProductId
} from "../../../redux/Customer/ReviewSlice";

import ProductReviewCard
import CustomLoader from "../../../components/CustomLoader";
from "./ProductReviewCard";

const ReviewPage = () => {

    const dispatch = useAppDispatch();

    const { productId } = useParams();

    const review = useAppSelector(
        (state: any) => state.review
    );

    useEffect(() => {

        if (productId) {

            dispatch(
                fetchReviewsByProductId({
                    productId
                })
            );

        }

    }, [dispatch, productId]);

    if (review.loading) {

        return (
            <Box className="flex justify-center mt-20">
                <CustomLoader />
            </Box>
        );

    }

    return (

        <div className="px-5 lg:px-20 py-10">

            <Typography
                variant="h5"
                fontWeight="bold"
                className="mb-10"
            >
                All Reviews
            </Typography>

            {/* NO REVIEWS */}
            {(!review.reviews ||
                review.reviews.length === 0) && (

                <Typography>
                    No reviews found
                </Typography>

            )}

            {/* ALL REVIEWS */}
            <div className="space-y-5">

                {(review.reviews || [])
                    .slice()
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                    .map(
                        (
                            item: any,
                            index: number
                        ) => (

                            <div key={index}>

                                <ProductReviewCard
                                    item={item}
                                />

                                <Divider
                                    sx={{ mt: 3 }}
                                />

                            </div>

                        )
                    )}

            </div>

        </div>

    );

};

export default ReviewPage;