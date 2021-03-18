import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { number } from '@storybook/addon-knobs';
import { CelebrationIcons } from './CelebrationIcons';

export default {
  title: 'Contacts/ContactRow/Widgets/CelebrationIcons',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth: number('anniversaryMonth', 2),
                anniversaryDay: number('anniversaryDay', 1),
                birthdayMonth: number('birthdayMonth', 2),
                birthdayDay: number('birthdayDay', 1),
              },
            ],
          },
        }}
      />
    </Box>
  );
};

export const HasBirthdayOnly = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth: number('anniversaryMonth', 2),
                anniversaryDay: number('anniversaryDay', 1),
                birthdayMonth: number('birthdayMonth', 1),
                birthdayDay: number('birthdayDay', 1),
              },
            ],
          },
        }}
      />
    </Box>
  );
};

export const HasAnniversaryOnly = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth: number('anniversaryMonth', 1),
                anniversaryDay: number('anniversaryDay', 1),
                birthdayMonth: number('birthdayMonth', 2),
                birthdayDay: number('birthdayDay', 1),
              },
            ],
          },
        }}
      />
    </Box>
  );
};

export const HasBoth = (): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth: number('anniversaryMonth', 1),
                anniversaryDay: number('anniversaryDay', 1),
                birthdayMonth: number('birthdayMonth', 1),
                birthdayDay: number('birthdayDay', 1),
              },
            ],
          },
        }}
      />
    </Box>
  );
};
