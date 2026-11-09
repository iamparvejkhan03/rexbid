import { CompanyContainer, CompanyHeader, CompanySidebar } from '../../components';
import CreateListingForm from '../../components/listing/CreateListingForm';

// The form itself is shared with the other account types: see
// components/listing/CreateListingForm.jsx.
const CreateAuction = () => (
    <CreateListingForm
        Container={CompanyContainer}
        Header={CompanyHeader}
        Sidebar={CompanySidebar}
        basePath="/company"
        defaultUserType="company"
    />
);

export default CreateAuction;
