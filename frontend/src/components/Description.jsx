function Description({ description }) {
    return (
        <div className="w-full overflow-hidden">
            <div
                className="prose max-w-none rounded-lg break-words
                [&_img]:max-w-full [&_img]:h-auto
                [&_pre]:overflow-x-auto [&_pre]:max-w-full
                [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto
                [&_iframe]:max-w-full"
            >
                {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                    <p className="text-gray-500">No description provided.</p>
                )}

                {/* HOW REXBID WORKS – always shown */}
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">HOW REXBID WORKS:</h3>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Register for free, click the Login icon and create your account.</li>
                        <li>
                            Check the listing details and contact the seller if you have any questions. Viewing can be
                            arranged at the seller's discretion.
                        </li>
                        <li>Place your bid online before bidding closes.</li>
                        <li>If you're the highest bidder and the reserve is met, you win.</li>
                        <li>Pay through RexBid, then collect directly from the seller or arrange delivery.</li>
                    </ol>
                    <p className="mt-3">
                        A buyer fee of 6% on the first €2,000 and 3% above that (maximum €500) is added to the winning
                        price. It is shown before you bid, so there are no hidden fees.{" "}
                        <a href="/payment-refund-policy#buyer-fee" className="underline">See fees &amp; payment</a>.
                    </p>
                    <p className="mt-3 text-sm">
                        *BIDS ARE LEGALLY BINDING. DO NOT PLACE A BID IF YOU DON'T HAVE THE CAPACITY TO COMPLETE THE
                        TRANSACTION. READ OUR BUYERS TERMS BEFORE PLACING A BID.*
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Description;