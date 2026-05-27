"use client";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TestimonialCard from "./Testimonial";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Michael O'Connor",
    position: "Farm Owner",
    review:
      "Great platform with genuine buyers and a very smooth selling process. Our tractor sold quicker than expected.",
    image: "",
    date: "May 15, 2026",
    rating: 5,
  },
  {
    name: "David Murphy",
    position: "Plant Hire Manager",
    review:
      "Easy to use, professional, and reliable. We've listed multiple machines and always had strong interest.",
    image: "",
    date: "June 3, 2026",
    rating: 5,
  },
  {
    name: "Sarah Byrne",
    position: "Transport Business Owner",
    review:
      "Found a great commercial van at a fair price. The whole process felt straightforward and transparent.",
    image: "",
    date: "April 22, 2026",
    rating: 4,
  },
  {
    name: "James McKenna",
    position: "Machinery Dealer",
    review:
      "RexBid gives us access to serious buyers across Ireland. Clean platform and excellent communication.",
    image: "",
    date: "July 8, 2026",
    rating: 5,
  },
  {
    name: "Patrick Doyle",
    position: "Fleet Manager",
    review:
      "We've used RexBid to move surplus equipment efficiently. Simple listings and quality enquiries every time.",
    image: "",
    date: "May 28, 2026",
    rating: 5,
  },
  {
    name: "Emma Walsh",
    position: "Agricultural Contractor",
    review:
      "A trusted marketplace for machinery and vehicles. The bidding process was easy from start to finish.",
    image: "",
    date: "June 1, 2026",
    rating: 5,
  },
];

export default function TestimonialSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 3,
      spacing: 30,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 24 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1, spacing: 20 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  return (
    <section className="relative px-5 py-8 md:px-16 md:py-10 lg:px-24 lg:py-12 xl:px-28 xl:py-14 bg-gradient-to-br from-white to-[#FDF8F0] overflow-hidden">
      {/* Background decorative elements with brand colors */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D19F3E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#072342]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 border border-[#D19F3E]/10 rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Header - redesigned */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20 mb-6">
            <Star size={14} className="text-[#D19F3E] fill-[#D19F3E]" />
            <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight">
            What Our{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                Customers Say
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="10"
                viewBox="0 0 200 10"
                fill="none"
              >
                <path
                  d="M2 7.5C50 3.5 130 2.5 198 7.5"
                  stroke="#D19F3E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
              </svg>
            </span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4 max-w-2xl mx-auto">
            Trusted by buyers and sellers across Ireland for machinery, vehicles, and agricultural equipment listings.
          </p>
        </div>

        {/* Slider with new navigation placement */}
        <div className="relative">
          {loaded && instanceRef.current && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-[#D19F3E] hover:text-white hover:border-[#D19F3E] transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-[#D19F3E] hover:text-white hover:border-[#D19F3E] transition-all duration-300"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div ref={sliderRef} className="keen-slider py-4">
            {testimonials.map((t, i) => (
              <div key={i} className="keen-slider__slide">
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dots - redesigned */}
        <div className="flex md:hidden items-center justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => instanceRef.current?.moveToIdx(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                ? "w-6 bg-[#D19F3E]"
                : "bg-gray-300 hover:bg-[#D19F3E]/50"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}