import RatingStars from "./RatingStars";

function ReviewsSection({ auction, auctionReviews }) {
    return (
        <>
            {
                auctionReviews.length > 0 && (
                    <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-2">Reviews</h3>
                        <div className="space-y-3">
                            {auctionReviews.map((review) => {
                                const isSellerReviewing = review.reviewer?._id === auction.seller?._id;
                                const role = isSellerReviewing ? "Seller" : "Bidder";
                                return (
                                    <div key={review._id} className="border-b border-gray-200 pb-3 last:border-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">
                                                    {review.reviewer?.firstName || review.reviewer?.username}
                                                </span>
                                                <span className="text-xs text-gray-500">({role})</span>
                                            </div>
                                            <RatingStars rating={review.rating} size={14} />
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default ReviewsSection;