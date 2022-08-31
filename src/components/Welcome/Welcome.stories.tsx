import React, { ReactElement } from 'react';
import { Button } from '@mui/material';
import SubjectIcon from '@material-ui/icons/Subject';
import Welcome from '.';

export default {
  title: 'Welcome',
  args: {
    title: 'Welcome to MPDX',
    subtitle:
      'MPDX is fundraising software from Cru that helps you grow and maintain your ministry partners in a quick and easy way.',
    imgSrc: null,
  },
  argTypes: {
    imgSrc: {
      name: 'imgSrc',
      options: {
        Default: null,
        Custom: require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`),
      },
      control: { type: 'select' },
    },
  },
};

export const Default = ({
  title,
  subtitle,
  imgSrc,
}: {
  title: string;
  subtitle: string;
  imgSrc: string;
}): ReactElement => {
  return (
    <Welcome title={title} subtitle={subtitle} imgSrc={imgSrc}>
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
