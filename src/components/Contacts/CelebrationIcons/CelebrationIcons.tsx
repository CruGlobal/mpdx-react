import { Box, styled } from '@material-ui/core';
import { Cake } from '@material-ui/icons';
import { DateTime, Interval } from 'luxon';
import React from 'react';
import { RingIcon } from '../RingIcon';
import { CelebrationItemsFragment } from './CelebrationItems.generated';

const IconContainer = styled(Box)(({}) => ({
  display: 'inline-block',
  width: '24px',
  height: '24px',
  margin: '1px',
}));

interface Props {
  contact: CelebrationItemsFragment;
}

export const CelebrationIcons: React.FC<Props> = ({ contact }) => {
  const occasionIsUpcoming = (month: number, day: number): boolean =>
    Interval.after(DateTime.now().startOf('day'), {
      days: 5,
    }).contains(
      DateTime.fromObject({
        month,
        day,
      }),
    );

  const contactHasAnniversary = (): boolean =>
    contact.people.nodes.some(
      ({ anniversaryMonth, anniversaryDay }) =>
        anniversaryMonth &&
        anniversaryDay &&
        occasionIsUpcoming(anniversaryMonth, anniversaryDay),
    ) ?? false;

  const contactHasBirthday = (): boolean =>
    contact.people.nodes.some(
      ({ birthdayMonth, birthdayDay }) =>
        birthdayMonth &&
        birthdayDay &&
        occasionIsUpcoming(birthdayMonth, birthdayDay),
    ) ?? false;

  return (
    <span role="celebration">
      {contactHasAnniversary() ? (
        <IconContainer role="ring">
          <RingIcon color="disabled" />
        </IconContainer>
      ) : null}
      {contactHasBirthday() ? (
        <IconContainer role="cake">
          <Cake color="disabled" />
        </IconContainer>
      ) : null}
    </span>
  );
};
