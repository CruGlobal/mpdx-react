import React, { ReactElement } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';
import { gql, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import AnimatedBox from '../../AnimatedBox';
import { GetThisWeekQuery } from '../../../../types/GetThisWeekQuery';
import PartnerCare from './PartnerCare/PartnerCare';
import TasksDueThisWeek from './TasksDueThisWeek/TasksDueThisWeek';
import LateCommitments from './LateCommitments';
import Referrals from './Referrals';
import Appeals from './Appeals';
import WeeklyActivity from './WeeklyActivity';

interface Props {
  accountListId: string;
}

export const GET_THIS_WEEK_QUERY = gql`
  query GetThisWeekQuery(
    $accountListId: ID!
    $endOfDay: ISO8601DateTime!
    $today: ISO8601Date!
    $twoWeeksFromNow: ISO8601Date!
    $twoWeeksAgo: ISO8601Date!
  ) {
    accountList(id: $accountListId) {
      id
      primaryAppeal {
        id
        name
        amount
        pledgesAmountTotal
        pledgesAmountProcessed
        amountCurrency
      }
    }
    dueTasks: tasks(
      accountListId: $accountListId
      first: 3
      startAt: { max: $endOfDay }
      completed: false
    ) {
      nodes {
        id
        subject
        activityType
        startAt
        completedAt
        contacts {
          nodes {
            name
          }
        }
      }
      totalCount
    }
    prayerRequestTasks: tasks(
      accountListId: $accountListId
      first: 3
      activityType: PRAYER_REQUEST
      completed: false
    ) {
      nodes {
        id
        subject
        activityType
        startAt
        completedAt
        contacts {
          nodes {
            name
          }
        }
      }
      totalCount
    }
    latePledgeContacts: contacts(
      accountListId: $accountListId
      first: 3
      lateAt: { max: $today }
      status: PARTNER_FINANCIAL
    ) {
      nodes {
        id
        name
        lateAt
      }
      totalCount
    }
    reportsPeopleWithBirthdays(
      accountListId: $accountListId
      range: "1m"
      endDate: $twoWeeksFromNow
    ) {
      periods {
        people {
          id
          birthdayDay
          birthdayMonth
          firstName
          lastName
          parentContact {
            id
          }
        }
      }
    }
    reportsPeopleWithAnniversaries(
      accountListId: $accountListId
      range: "1m"
      endDate: $twoWeeksFromNow
    ) {
      periods {
        people {
          id
          anniversaryDay
          anniversaryMonth
          parentContact {
            id
            name
          }
        }
      }
    }
    recentReferrals: contacts(
      accountListId: $accountListId
      first: 3
      referrer: ANY
      createdAt: { min: $twoWeeksAgo }
    ) {
      nodes {
        id
        name
      }
      totalCount
    }
    onHandReferrals: contacts(
      accountListId: $accountListId
      first: 3
      status: [
        NEVER_CONTACTED
        ASK_IN_FUTURE
        CULTIVATE_RELATIONSHIP
        CONTACT_FOR_APPOINTMENT
      ]
      referrer: ANY
    ) {
      nodes {
        id
        name
      }
      totalCount
    }
  }
`;

const ThisWeek = ({ accountListId }: Props): ReactElement => {
  const endOfDay = DateTime.local().endOf('day');

  const { t } = useTranslation();

  const { data, loading } = useQuery<GetThisWeekQuery>(GET_THIS_WEEK_QUERY, {
    variables: {
      accountListId,
      endOfDay: endOfDay.toISO(),
      today: endOfDay.toISODate(),
      twoWeeksFromNow: endOfDay.plus({ weeks: 2 }).toISO(),
      twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISO(),
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
          <Typography variant="h6">{t('To Do This Week')}</Typography>
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
