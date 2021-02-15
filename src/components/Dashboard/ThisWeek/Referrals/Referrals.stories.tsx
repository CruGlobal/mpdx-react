import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import {
  GetThisWeekQuery_recentReferrals,
  GetThisWeekQuery_onHandReferrals,
} from '../../../../../types/GetThisWeekQuery';
import Referrals from '.';

export default {
  title: 'Dashboard/ThisWeek/Referrals',
};

export const Default = (): ReactElement => {
  const contact = {
    id: 'contact',
    name: 'Smith, Sarah',
  };
  const recentReferrals: GetThisWeekQuery_recentReferrals = {
    nodes: [
      { ...contact, id: 'contact_1' },
      { ...contact, id: 'contact_2' },
      { ...contact, id: 'contact_3' },
    ],
    totalCount: 5,
  };
  const onHandReferrals: GetThisWeekQuery_onHandReferrals = {
    nodes: [
      { ...contact, id: 'contact_4' },
      { ...contact, id: 'contact_5' },
      { ...contact, id: 'contact_6' },
    ],
    totalCount: 5,
  };
  return (
    <Box m={2}>
      <Referrals
        loading={false}
        recentReferrals={recentReferrals}
        onHandReferrals={onHandReferrals}
      />
    </Box>
  );
};

export const Empty = (): ReactElement => {
  const recentReferrals: GetThisWeekQuery_recentReferrals = {
    nodes: [],
    totalCount: 0,
  };
  const onHandReferrals: GetThisWeekQuery_onHandReferrals = {
    nodes: [],
    totalCount: 0,
  };
  return (
    <Box m={2}>
      <Referrals
        loading={false}
        recentReferrals={recentReferrals}
        onHandReferrals={onHandReferrals}
      />
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <Referrals loading={true} />
    </Box>
  );
};
