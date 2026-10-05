import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";
import {
    ensureClockStarted,
    reanchorFromSocket,
} from "../utils/serverClock";
import { convertAuctionPrices } from "../utils/convertAuctionPrices.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export function useLiveAuctionTicks(setAuctions) {
    const { user } = useAuth();
    const userCurrency = user?.currency || "EUR";

    // Keep currency in a ref so we don't re-subscribe on currency change
    const currencyRef = useRef(userCurrency);
    useEffect(() => { currencyRef.current = userCurrency; }, [userCurrency]);

    useEffect(() => {
        const onTick = (tick) => {
            setAuctions((prev) =>
                prev.map((a) => {
                    if (a._id !== tick._id) return a;

                    // Merge raw tick fields onto existing auction,
                    // keeping rates/baseCurrency fresh from the tick.
                    const merged = {
                        ...a,
                        ...tick,
                        rates: tick.rates || a.rates,
                        baseCurrency: tick.baseCurrency || a.baseCurrency,
                    };

                    return convertAuctionPrices(merged, currencyRef.current);
                })
            );
        };

        const onRemoved = ({ _id }) => {
            setAuctions((prev) => prev.filter((a) => a._id !== _id));
        };

        socket.on("auction:tick", onTick);
        socket.on("auction:removed", onRemoved);

        return () => {
            socket.off("auction:tick", onTick);
            socket.off("auction:removed", onRemoved);
        };
    }, [setAuctions]);
}