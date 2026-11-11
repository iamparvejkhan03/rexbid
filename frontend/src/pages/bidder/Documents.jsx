import { AccountInactiveBanner, BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import DocumentsList from "../../components/documents/DocumentsList";

function Documents() {
    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />
            <div className="w-full relative">
                <BidderHeader />
                <BidderContainer>
                    <AccountInactiveBanner />
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Documents</h2>
                        <p className="text-gray-600">Payment requests and receipts for your purchases.</p>
                    </div>

                    <DocumentsList emptyText="No documents yet. When you win an auction, your payment request will appear here." />
                </BidderContainer>
            </div>
        </section>
    );
}

export default Documents;
