import { makeStyles, SvgIcon, Theme } from '@material-ui/core';
import { Cake } from '@material-ui/icons';
import { DateTime, Interval } from 'luxon';
import React from 'react';
import { CelebrationItemsFragment } from './CelebrationItems.generated';

const useStyles = makeStyles((theme: Theme) => ({
  contactCelebration: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    color: theme.palette.text.secondary,
    margin: '1px',
  },
}));

interface Props {
  contact: CelebrationItemsFragment;
}

export const CelebrationIcons: React.FC<Props> = ({ contact }) => {
  const classes = useStyles();

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
    <>
      {contactHasAnniversary() ? (
        <SvgIcon className={classes.contactCelebration}>
          <path d="M12 10L8 4.4L9.6 2H14.4L16 4.4L12 10ZM15.5 6.8L14.3 8.5C16.5 9.4 18 11.5 18 14C18 15.5913 17.3679 17.1174 16.2426 18.2426C15.1174 19.3679 13.5913 20 12 20C10.4087 20 8.88258 19.3679 7.75736 18.2426C6.63214 17.1174 6 15.5913 6 14C6 11.5 7.5 9.4 9.7 8.5L8.5 6.8C5.8 8.1 4 10.8 4 14C4 16.1217 4.84285 18.1566 6.34315 19.6569C7.84344 21.1571 9.87827 22 12 22C14.1217 22 16.1566 21.1571 17.6569 19.6569C19.1571 18.1566 20 16.1217 20 14C20 10.8 18.2 8.1 15.5 6.8Z" />
        </SvgIcon>
      ) : null}
      {contactHasBirthday() ? (
        <Cake className={classes.contactCelebration} />
      ) : null}
    </>
  );
};
