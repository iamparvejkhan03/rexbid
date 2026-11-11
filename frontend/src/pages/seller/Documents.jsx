import { SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import DocumentsList from "../../components/documents/DocumentsList";

function Documents() {
    return (
        <section className="flex min-h-screen bg-gray-50">
            <SellerSidebar />
            <div className="w-full relative">
                <SellerHeader />
                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Documents</h2>
                        <p className="text-gray-600">Seller statements for your sales, and receipts for anything you have bought.</p>
                    </div>
                    <DocumentsList emptyText="No documents yet. When one of your items sells and the buyer pays, your seller statement will appear here." />
                </SellerContainer>
            </div>
        </section>
    );
}

export default Documents;
