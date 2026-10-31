import { Link } from "react-router-dom";
import { Calendar, ArrowUpRight } from "lucide-react";

function CatalogueCard({ catalogue }) {
    const closingDate = new Date(catalogue.closingDate);
    const isPast = closingDate < new Date();

    return (
        <Link
            to={`/catalogue/${catalogue._id}`}
            className="group block h-full cursor-pointer"
        >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#C59D55]/30 group-hover:shadow-[0_28px_65px_-20px_rgba(197,157,85,0.35)] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-gray-100">
                    <img
                        src={catalogue.image?.url}
                        alt={catalogue.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10 transition-opacity duration-500 group-hover:opacity-90" />
                    <div className="absolute left-3 top-3">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${isPast
                                    ? "bg-gray-100/90 text-gray-700 border-gray-200"
                                    : "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                                }`}
                        >
                            {isPast ? "Past" : "Live"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col px-1 pt-5">
                    <h3 className="line-clamp-2 text-[17px] font-bold leading-6 tracking-tight text-gray-900 transition-colors group-hover:text-[#A17B35]">
                        {catalogue.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={13} className="shrink-0" />
                        <span>
                            Closing{" "}
                            {closingDate.toLocaleDateString("en-IE", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="text-xs font-medium text-[#A17B35]">
                            View Catalogue
                        </span>
                        <ArrowUpRight
                            size={16}
                            className="text-[#A17B35] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </div>
                </div>

                <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#F5B51B] to-[#e8a200] transition-all duration-500 group-hover:w-full motion-reduce:transition-none" />
            </div>
        </Link>
    );
}

export default CatalogueCard;