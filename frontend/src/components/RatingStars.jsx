import { Star } from "lucide-react";

const RatingStars = ({ rating, size = 16 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    fill={star <= rating ? "#f97316" : "none"}
                    stroke="#f97316"
                    className="transition-colors"
                />
            ))}
        </div>
    );
};

export default RatingStars;