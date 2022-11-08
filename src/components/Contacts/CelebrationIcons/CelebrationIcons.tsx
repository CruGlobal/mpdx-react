import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Cake from '@mui/icons-material/Cake';
import { DateTime, Interval } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        <IconContainer>
          <RingIcon color="disabled" titleAccess={t('Ring')} />
        </IconContainer>
      ) : null}
      {contactHasBirthday() ? (
        <IconContainer>
          <Cake color="disabled" titleAccess={t('Cake')} />
        </IconContainer>
      ) : null}
    </>
  );
};
