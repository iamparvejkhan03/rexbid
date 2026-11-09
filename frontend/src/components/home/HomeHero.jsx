import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, MapPin, Search } from "lucide-react";
import Container from "../Container";
import { livePrice, money, timeLeft, useNow } from "./shared";

const POINTS = [
    "No seller fees until 2027",
    "You set the reserve",
    "Paid securely after collection",
    "The machine stays in your yard until it's sold",
];

function ClosingNextPanel({ items, currency }) {
    const now = useNow(1000);
    const list = items.filter((a) => new Date(a.endDate).getTime() > now).slice(0, 3);
    if (list.length === 0) return null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_50px_-25px_rgba(7,35,66,0.35)] md:p-5">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#072342]">Closing next</p>
                <Link to="/auctions" className="text-sm font-medium text-[#A17B35] hover:underline">
                    See all
                </Link>
            </div>
            <ul className="divide-y divide-gray-100">
                {list.map((a) => (
                    <li key={a._id}>
                        <Link to={`/auction/${a._id}`} className="group flex items-center gap-3 py-3">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-[72px] md:w-24">
                                {a.photos?.[0]?.url && (
                                    <img src={a.photos[0].url} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900 group-hover:text-[#A17B35]">{a.title}</p>
                                {a.location && (
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                                        <MapPin size={12} className="shrink-0" /> {a.location}
                                    </p>
                                )}
                                <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                                    <Clock size={12} className="shrink-0 text-[#D19F3E]" />
                                    <span className="tabular-nums">{timeLeft(a.endDate, now)}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[#072342]">{money(livePrice(a), currency)}</p>
                                <p className="text-xs text-gray-500">
                                    {a.bidCount || 0} {a.bidCount === 1 ? "bid" : "bids"}
                                </p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function HomeHero({ items, currency, excludeId, belowBanner }) {
    const panelItems = excludeId ? items.filter((a) => a._id !== excludeId) : items;

    return (
        <section
            className={`relative overflow-hidden bg-gradient-to-b from-white to-[#F6F7F9] ${belowBanner ? "pt-10 md:pt-14" : "pt-[108px] md:pt-[140px]"} pb-12 md:pb-20`}
        >
            {/* soft gold glow, top right */}
            <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#D19F3E]/10 blur-3xl" />

            <Container>
                <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                    <div>
                        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#072342]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#072342]">
                            Ireland's machinery marketplace
                        </p>
                        <h1 className="text-[2.1rem] font-bold leading-[1.1] tracking-tight text-[#072342] md:text-5xl xl:text-[3.4rem]">
                            Sell your machinery to buyers{" "}
                            <span className="text-[#C08A2C]">all over Ireland</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
                            List your tractor, digger or plant machine in 5 minutes. You set the reserve, buyers
                            compete online, and we collect the money for you.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/sell"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] px-7 py-3.5 font-bold text-[#072342] shadow-md transition hover:shadow-lg"
                            >
                                Sell your machine
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/auctions"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#072342]/20 bg-white px-7 py-3.5 font-semibold text-[#072342] transition hover:border-[#072342]/50"
                            >
                                Browse machinery
                                <Search size={18} />
                            </Link>
                        </div>

                        <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                            {POINTS.map((p) => (
                                <li key={p} className="flex items-start gap-2 text-[15px] text-gray-700">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D19F3E]/15">
                                        <Check size={13} className="text-[#A17B35]" strokeWidth={3} />
                                    </span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <ClosingNextPanel items={panelItems} currency={currency} />
                </div>
            </Container>
        </section>
    );
}

export default HomeHero;
