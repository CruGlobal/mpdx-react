import React, { ReactElement } from 'react';
import ContactDetails from '../Details';

interface Props {
    contactId?: string;
}

const ContactShow = ({ contactId }: Props): ReactElement => {
    return (
        <>
            <ContactDetails contactId={contactId} />
        </>
    );
};

export default ContactShow;
