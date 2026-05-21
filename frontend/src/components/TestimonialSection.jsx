"use client";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TestimonialCard from "./Testimonial";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Erik Johansson",
    position: "Construction Manager",
    review:
      "BidNordic has transformed how we buy machinery. Smooth auctions, clear communication, and great prices. Highly recommended.",
    image: "/avatars/1.jpg",
    date: "May 15, 2025"
  },
  {
    name: "Anna Lindgren",
    position: "Procurement Director",
    review:
      "We've sold several excavators through BidNordic. Professional service and seamless transactions from start to finish. We'll definitely be back.",
    image: "/avatars/2.jpg",
    date: "June 3, 2025"
  },
  {
    name: "Lars Nilsson",
    position: "Operations Manager",
    review:
      "Great selection of quality machines. We recently bought a tractor and the process was simple from start to finish. Trustworthy and reliable.",
    image: "/avatars/3.jpg",
    date: "April 22, 2025"
  },
  {
    name: "Maria Svensson",
    position: "Project Manager",
    review:
      "Finally a platform that understands the Nordic market. Great support, transparent bidding, and fast delivery. Top marks!",
    image: "/avatars/4.jpg",
    date: "July 8, 2025"
  },
  {
    name: "Anders Petersen",
    position: "Fleet Manager",
    review:
      "We use BidNordic for all our surplus equipment. The platform is intuitive, the buyers are serious, and the payouts are fast. Couldn't ask for more.",
    image: "/avatars/5.jpg",
    date: "May 28, 2025"
  },
  {
    name: "Karin Lundström",
    position: "CEO",
    review:
      "As a rental company, we need reliable partners. BidNordic has helped us refresh our fleet efficiently. Great results every time.",
    image: "/avatars/6.jpg",
    date: "June 17, 2025"
  },
];

export default function TestimonialSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 3,
      spacing: 24,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1, spacing: 16 },
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
    <section className="my-14 bg-gray-50">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="text-left">

          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              What Our Clients Say
            </h2>
            {/* Navigation Arrows */}
            {loaded && instanceRef.current && (
              <div className="hidden md:flex justify-end gap-2 mt-4">
                <button
                  onClick={() => instanceRef.current?.prev()}
                  className="h-10 w-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center cursor-pointer hover:bg-orange-200 transition-all text-orange-500"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => instanceRef.current?.next()}
                  className="h-10 w-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center cursor-pointer hover:bg-orange-200 transition-all text-orange-500"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-gray-500 mt-3 mb-8">
            Join thousands of satisfied buyers and sellers across the Nordics who trust BidNordic for their heavy equipment needs.
          </p>
        </div>

        {/* Slider */}
        <div className="mt-12 md:mt-6">
          <div ref={sliderRef} className="keen-slider">
            {testimonials.map((t, i) => (
              <div key={i} className="keen-slider__slide">
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dots */}
        <div className="flex md:hidden items-center justify-center mt-5 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => instanceRef.current?.moveToIdx(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-neutral-800" : "bg-neutral-300"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}