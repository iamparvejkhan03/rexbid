import { useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const ReviewModal = ({ isOpen, onClose, auctionId, revieweeId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        try {
            setLoading(true);
            await axiosInstance.post(`/api/v1/reviews/auction/${auctionId}`, {
                rating,
                comment,
                revieweeId,
            });
            toast.success("Review submitted successfully");
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        size={32}
                                        fill={(hoverRating || rating) >= star ? "#f97316" : "none"}
                                        stroke="#f97316"
                                        className="transition-colors"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]"
                            placeholder="Share your experience..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#D19F3E] text-white py-2 rounded-md hover:bg-[#E8B86B] disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;