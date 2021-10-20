import React, { ReactElement } from 'react';
import PageHeading from './PageHeading';

export default {
  title: 'PageHeading',
  args: {
    heading: 'Good Afternoon, Sarah.',
    subheading: 'Welcome back to MPDX. Here is what has been happening.',
    imgSrc: null,
    overlap: 20,
  },
  argTypes: {
    imgSrc: {
      options: {
        Default: null,
        Custom: require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`),
      },
      control: { type: 'select' },
    },
    overlap: { control: { type: 'range', min: 20, max: 100, step: 1 } },
  },
};

export const Default = ({
  heading,
  subheading,
  imgSrc,
  overlap,
}: {
  heading: string;
  subheading: string;
  imgSrc: string;
  overlap: number;
}): ReactElement => (
  <PageHeading
    heading={heading}
    subheading={subheading}
    imgSrc={imgSrc}
    overlap={overlap}
  />
);

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
