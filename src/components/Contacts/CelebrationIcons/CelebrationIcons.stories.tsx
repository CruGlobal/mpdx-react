import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { boolean } from '@storybook/addon-knobs';
import { CelebrationIcons } from './CelebrationIcons';

export default {
  title: 'Contacts/ContactRow/Widgets/CelebrationIcons',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        hasAnniversary={boolean('hasAnniversary', false)}
        hasBirthday={boolean('hasBirthday', false)}
      />
    </Box>
  );
};

export const HasBirthdayOnly = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        hasAnniversary={boolean('hasAnniversary', false)}
        hasBirthday={boolean('hasBirthday', true)}
      />
    </Box>
  );
};

export const HasAnniversaryOnly = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        hasAnniversary={boolean('hasAnniversary', true)}
        hasBirthday={boolean('hasBirthday', false)}
      />
    </Box>
  );
};

export const HasBoth = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        hasAnniversary={boolean('hasAnniversary', true)}
        hasBirthday={boolean('hasBirthday', true)}
      />
    </Box>
  );
};
