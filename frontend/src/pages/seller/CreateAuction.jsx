import { SellerContainer, SellerHeader, SellerSidebar } from '../../components';
import CreateListingForm from '../../components/listing/CreateListingForm';

// The form itself is shared with the other account types: see
// components/listing/CreateListingForm.jsx.
const CreateAuction = () => (
    <CreateListingForm
        Container={SellerContainer}
        Header={SellerHeader}
        Sidebar={SellerSidebar}
        basePath="/seller"
        defaultUserType="seller"
    />
);

export default CreateAuction;
