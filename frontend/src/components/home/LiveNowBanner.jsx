import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import Container from "../Container";
import { irishDayKey, livePrice, money, timeLeft, useNow } from "./shared";

/**
 * Shown at the very top of the homepage on a sale day: the listing that is
 * closing right now (the next one to close today, Irish time), with a photo,
 * live price and countdown. Rolls on to the next listing when it closes.
 * Hidden when nothing closes today.
 */
function LiveNowBanner({ items, currency }) {
    const now = useNow(1000);
    const today = irishDayKey(now);
    const closingToday = items
        .filter((a) => new Date(a.endDate).getTime() > now && irishDayKey(a.endDate) === today)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const current = closingToday[0];
    if (!current) return null;

    const more = closingToday.length - 1;
    const photo = current.photos?.[0]?.url;
    const msLeft = new Date(current.endDate).getTime() - now;
    const urgent = msLeft < 15 * 60 * 1000;

    return (
        <section className="bg-white pt-[72px] md:pt-[84px]" aria-label="Closing now">
            <Container>
                <Link
                    to={`/auction/${current._id}`}
                    className="group mt-4 flex flex-col overflow-hidden rounded-2xl bg-[#072342] shadow-lg ring-1 ring-[#072342]/10 transition hover:ring-2 hover:ring-[#D19F3E] sm:flex-row"
                >
                    <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-[#0b2d52] sm:aspect-auto sm:min-h-[190px] sm:w-64 md:w-72">
                        {photo && (
                            <img
                                src={photo}
                                alt={current.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:absolute sm:inset-0"
                            />
                        )}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            Closing now
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-3 p-4 md:gap-4 md:px-7 md:py-5">
                        <div>
                            <h2 className="text-base font-bold leading-snug text-white md:text-2xl">{current.title}</h2>
                            {current.location && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-300">
                                    <MapPin size={14} /> {current.location}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
                            <div>
                                <p className="text-xs text-gray-400">{current.bidCount > 0 ? "Current bid" : "Starting at"}</p>
                                <p className="text-xl font-bold text-white md:text-3xl">{money(livePrice(current), currency)}</p>
                                <p className="text-xs text-[#E8B86B]">
                                    {current.bidCount || 0} {current.bidCount === 1 ? "bid" : "bids"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Closes in</p>
                                <p className={`flex items-center gap-1.5 text-xl font-bold tabular-nums md:text-3xl ${urgent ? "text-red-400" : "text-white"}`}>
                                    <Clock size={20} className="text-[#D19F3E]" />
                                    {timeLeft(current.endDate, now)}
                                </p>
                                {more > 0 && <p className="text-xs text-gray-400">then {more} more closing today</p>}
                            </div>
                            <span className="ml-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] px-6 py-2.5 text-sm font-bold md:py-3 md:text-base text-[#072342] sm:w-auto">
                                View listing
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </div>
                </Link>
            </Container>
        </section>
    );
}

export default LiveNowBanner;
