import { Link } from "react-router-dom";
import { useSeo } from "../utils/seo";

// Catch-all for unknown URLs. The static host still answers HTTP 200, so we
// tell search engines not to index the page.
const NotFound = () => {
    useSeo({ title: "Page not found | RexBid", description: "This page doesn't exist.", noindex: true });

    return (
        <section className="max-w-3xl mx-auto px-4 py-24 text-center">
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">Page not found</h1>
            <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has moved.</p>
            <div className="flex flex-wrap justify-center gap-3">
                <Link to="/auctions" className="bg-primary text-white px-5 py-2.5 rounded-md hover:bg-primary-dark">
                    Browse live auctions
                </Link>
                <Link to="/" className="border border-gray-300 px-5 py-2.5 rounded-md hover:bg-gray-100">
                    Go to the homepage
                </Link>
            </div>
        </section>
    );
};

export default NotFound;
