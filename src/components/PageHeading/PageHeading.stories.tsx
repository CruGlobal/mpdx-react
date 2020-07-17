import React, { ReactElement } from 'react';
import { text, select, number } from '@storybook/addon-knobs';
import PageHeading from './PageHeading';

export default {
    title: 'PageHeading',
};

export const Default = (): ReactElement => {
    const options = {
        range: true,
        min: 20,
        max: 100,
        step: 1,
    };

    return (
        <PageHeading
            heading={text('heading', 'Good Afternoon, Sarah.')}
            subheading={text('subheading', 'Welcome back to MPDX. Here is what has been happening.')}
            imgSrc={select(
                'imgSrc',
                { Default: null, Custom: require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`) },
                null,
            )}
            overlap={number('overlap', 20, options)}
        />
    );
};
