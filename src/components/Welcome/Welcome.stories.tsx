import React, { ReactElement } from 'react';
import { Button } from '@material-ui/core';
import SubjectIcon from '@material-ui/icons/Subject';
import { text, select } from '@storybook/addon-knobs';
import Welcome from '.';

export default {
    title: 'Welcome',
};

export const Default = (): ReactElement => {
    return (
        <Welcome
            title={text('title', 'Welcome to MPDX')}
            subtitle={text(
                'subtitle',
                'MPDX is fundraising software from Cru that helps you grow and maintain your ministry partners in a quick and easy way.',
            )}
            imgSrc={select(
                'imgSrc',
                { Default: null, Custom: require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`) },
                null,
            )}
        >
            <Button size="large" variant="contained">
                Get Started
            </Button>
            <Button
                size="large"
                startIcon={<SubjectIcon />}
                href="https://help.mpdx.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fff' }}
            >
                Find help
            </Button>
        </Welcome>
    );
};

Default.story = {
    parameters: {
        chromatic: { delay: 1000 },
    },
};
