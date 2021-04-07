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
    contact.people.nodes.some((person) =>
      occasionIsUpcoming(person.anniversaryMonth, person.anniversaryDay),
    );

  const contactHasBirthday = (): boolean =>
    contact.people.nodes.some((person) =>
      occasionIsUpcoming(person.birthdayMonth, person.birthdayDay),
    );

  return (
    <>
      {contactHasAnniversary() ? (
        <IconContainer>
          <RingIcon />
        </IconContainer>
      ) : null}
      {contactHasBirthday() ? (
        <IconContainer>
          <Cake color="disabled" />
        </IconContainer>
      ) : null}
    </>
  );
};
