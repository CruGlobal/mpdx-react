import React, { ReactElement } from 'react';
import PageHeading from '../../PageHeading';

interface Props {
    firstName?: string;
}

const Welcome = ({ firstName }: Props): ReactElement => {
    const today = new Date();
    const currentHour = today.getHours();

    let greeting = 'Good Evening,';

    if (currentHour < 12) {
        greeting = 'Good Morning,';
    } else if (currentHour < 18) {
        greeting = 'Good Afternoon,';
    }
    if (firstName) {
        greeting = `${greeting} ${firstName}.`;
    }

    return (
        <PageHeading
            heading={greeting}
            subheading="Welcome back to MPDX. Here's what's been happening."
            imgSrc={require('../../../images/drawkit/grape/drawkit-grape-pack-illustration-9.svg')}
        />
    );
};

export default Welcome;
