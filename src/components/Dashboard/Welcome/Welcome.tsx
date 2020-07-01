import React, { ReactElement } from 'react';
import { Typography } from '@material-ui/core';
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
        greeting = greeting + ` ${firstName}.`;
    }

    return (
        <PageHeading
            heading={
                <>
                    <Typography variant="h4" component="h1">
                        {greeting}
                    </Typography>
                    <Typography>Welcome back to MPDX. Here&apos;s what&apos;s been happening.</Typography>
                </>
            }
            illustration={9}
            overlap={20}
        />
    );
};

export default Welcome;
