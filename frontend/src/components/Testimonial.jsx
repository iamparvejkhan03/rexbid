import { Quote, Star } from "lucide-react";
import { dummyUserImg } from "../assets";

function TestimonialCard({ name, position, review, image, date, rating = 5 }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 h-full flex flex-col">
      {/* Brand color top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]" />

      {/* Decorative quote icon - positioned behind */}
      <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote size={80} className="text-[#072342]" />
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {/* Rating stars - new design */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < rating
                  ? "text-[#D19F3E] fill-[#D19F3E]"
                  : "text-gray-300 fill-gray-200"
              }`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-2">{date}</span>
        </div>

        {/* Review text */}
        <p className="text-gray-600 leading-relaxed text-base flex-1 mb-6 italic">
          “{review}”
        </p>

        {/* User info - modern layout */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <img
              src={image || dummyUserImg}
              alt={name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D19F3E]/20 group-hover:ring-[#D19F3E]/40 transition-all"
            />
            {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" /> */}
          </div>
          <div>
            <p className="font-semibold text-[#072342] text-base">{name}</p>
            <p className="text-xs text-gray-400">{position}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;