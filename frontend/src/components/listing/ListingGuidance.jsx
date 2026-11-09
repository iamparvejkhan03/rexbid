// Plain-English guidance shown to sellers while they create a listing.
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

const STEPS = [
    "Create your listing (about 5 minutes)",
    "We check it, usually within 12 hours",
    "It goes live for your sale date and we email you",
    "Buyers bid online",
    "We collect the money and pay you after collection",
];

export const HowSellingWorks = () => (
    <div className="mb-6 rounded-xl border border-[#D19F3E]/40 bg-[#D19F3E]/[0.07] p-4 md:p-5">
        <p className="mb-3 font-semibold text-gray-900">How selling on RexBid works</p>
        <ol className="grid gap-2 text-sm text-gray-700 md:grid-cols-5 md:gap-3">
            {STEPS.map((s, i) => (
                <li key={s} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#072342] text-[11px] font-bold text-white">
                        {i + 1}
                    </span>
                    <span>{s}</span>
                </li>
            ))}
        </ol>
        <p className="mt-3 text-sm">
            <Link to="/about" target="_blank" className="font-medium text-[#A17B35] underline">How RexBid works</Link>
            {" · "}
            <Link to="/payment-refund-policy" target="_blank" className="font-medium text-[#A17B35] underline">Fees &amp; payment</Link>
            {" · "}
            <Link to="/seller-agreement" target="_blank" className="font-medium text-[#A17B35] underline">Seller Agreement</Link>
        </p>
    </div>
);

/** Small grey helper text under a field. */
export const Hint = ({ children }) => (
    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{children}</p>
);

/** Highlighted note box. */
export const Note = ({ children, tone = "info" }) => (
    <div
        className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
            tone === "warn" ? "bg-orange-50 text-orange-800" : "bg-blue-50 text-blue-900"
        }`}
    >
        <Info size={16} className="mt-0.5 shrink-0" />
        <div>{children}</div>
    </div>
);
