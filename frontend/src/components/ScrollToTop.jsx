import { useLayoutEffect, useEffect, useRef } from "react";
import { useLocation } from "react-router";

function ScrollToTop() {
    const { pathname } = useLocation();
    const firstRender = useRef(true);

    useEffect(() => {
        if (!("scrollRestoration" in window.history)) return;

        const prev = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";

        return () => {
            window.history.scrollRestoration = prev;
        };
    }, []);

    useLayoutEffect(() => {
        // Don't scroll to top if we're returning to a specific auction
        const returnToAuction = sessionStorage.getItem("returnToAuction");

        if (pathname === "/auctions" && returnToAuction) {
            return;
        }

        if (firstRender.current) {
            window.scrollTo(0, 0);
            firstRender.current = false;
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }, [pathname]);

    useEffect(() => {
        const onPageShow = () => {
            const returnToAuction =
                sessionStorage.getItem("returnToAuction");

            if (!returnToAuction) {
                window.scrollTo(0, 0);
            }
        };

        window.addEventListener("pageshow", onPageShow);

        return () => {
            window.removeEventListener("pageshow", onPageShow);
        };
    }, []);

    return null;
}

export default ScrollToTop;