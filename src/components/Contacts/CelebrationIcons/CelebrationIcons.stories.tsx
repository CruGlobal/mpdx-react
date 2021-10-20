import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { CelebrationIcons } from './CelebrationIcons';

interface Props {
  anniversaryMonth: number;
  anniversaryDay: number;
  birthdayMonth: number;
  birthdayDay: number;
}

export default {
  title: 'Contacts/ContactRow/Widgets/CelebrationIcons',
};

export const Default = ({
  anniversaryMonth,
  anniversaryDay,
  birthdayMonth,
  birthdayDay,
}: Props): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth,
                anniversaryDay,
                birthdayMonth,
                birthdayDay,
              },
            ],
          },
        }}
      />
    </Box>
  );
};
Default.args = {
  anniversaryMonth: 2,
  anniversaryDay: 1,
  birthdayMonth: 2,
  birthdayDay: 1,
};

export const HasBirthdayOnly = ({
  anniversaryMonth,
  anniversaryDay,
  birthdayMonth,
  birthdayDay,
}: Props): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth,
                anniversaryDay,
                birthdayMonth,
                birthdayDay,
              },
            ],
          },
        }}
      />
    </Box>
  );
};
HasBirthdayOnly.args = {
  anniversaryMonth: 1,
  anniversaryDay: 1,
  birthdayMonth: 2,
  birthdayDay: 1,
};

export const HasAnniversaryOnly = ({
  anniversaryMonth,
  anniversaryDay,
  birthdayMonth,
  birthdayDay,
}: Props): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth,
                anniversaryDay,
                birthdayMonth,
                birthdayDay,
              },
            ],
          },
        }}
      />
    </Box>
  );
};
HasAnniversaryOnly.args = {
  anniversaryMonth: 1,
  anniversaryDay: 1,
  birthdayMonth: 2,
  birthdayDay: 1,
};

export const HasBoth = ({
  anniversaryMonth,
  anniversaryDay,
  birthdayMonth,
  birthdayDay,
}: Props): ReactElement => {
  return (
    <Box m={2}>
      <CelebrationIcons
        contact={{
          people: {
            nodes: [
              {
                anniversaryMonth,
                anniversaryDay,
                birthdayMonth,
                birthdayDay,
              },
            ],
          },
        }}
      />
    </Box>
  );
};
HasBoth.args = {
  anniversaryMonth: 1,
  anniversaryDay: 1,
  birthdayMonth: 1,
  birthdayDay: 1,
};
