import React, { ReactElement } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedBox from '../../AnimatedBox';
import Appeals from './Appeals';
import { useGetThisWeekQuery } from './GetThisWeek.generated';
import LateCommitments from './LateCommitments/LateCommitments';
import NewsletterMenu from './NewsletterMenu/NewsletterMenu';
import PartnerCare from './PartnerCare/PartnerCare';
import Referrals from './Referrals';
import TasksDueThisWeek from './TasksDueThisWeek/TasksDueThisWeek';
import WeeklyActivity from './WeeklyActivity';

interface Props {
  accountListId: string;
}

const ThisWeek = ({ accountListId }: Props): ReactElement => {
  const endOfDay = DateTime.local().endOf('day');

  const { t } = useTranslation();

  const { data, loading } = useGetThisWeekQuery({
    variables: {
      accountListId,
      endOfDay: endOfDay.toISO(),
      today: endOfDay.toISODate(),
      threeWeeksFromNow: endOfDay.plus({ weeks: 3 }).toISODate(),
      twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
    },
  });

  const {
    dueTasks,
    prayerRequestTasks,
    latePledgeContacts,
    reportsPeopleWithBirthdays,
    reportsPeopleWithAnniversaries,
    recentReferrals,
    onHandReferrals,
    accountList,
  } = data || {};

  return (
    <>
      <Box my={{ xs: 1, sm: 2 }}>
        <AnimatedBox>
          <Typography variant="h6">
            <Box display="flex">
              <Box flexGrow={1}>{t('To Do This Week')}</Box>
              <NewsletterMenu accountListId={accountListId} />
            </Box>
          </Typography>
        </AnimatedBox>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <PartnerCare
            loading={loading}
            prayerRequestTasks={prayerRequestTasks}
            reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
            reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
            accountListId={accountListId}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TasksDueThisWeek
            loading={loading}
            dueTasks={dueTasks}
            accountListId={accountListId}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LateCommitments
            loading={loading}
            latePledgeContacts={latePledgeContacts}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Referrals
            loading={loading}
            recentReferrals={recentReferrals}
            onHandReferrals={onHandReferrals}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Appeals loading={loading} appeal={accountList?.primaryAppeal} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WeeklyActivity accountListId={accountListId} />
        </Grid>
      </Grid>
    </>
  );
};

export default ThisWeek;
