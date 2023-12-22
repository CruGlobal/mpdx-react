import React, { Fragment, useMemo, useState } from 'react';
// TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Box, Button, ButtonGroup, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import DonationHistories from 'src/components/Dashboard/DonationHistories';
import { useGetTaskAnalyticsQuery } from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import { useGetDonationGraphQuery } from 'src/components/Reports/DonationsReport/GetDonationGraph.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';
import theme from 'src/theme';
import { MultilineSkeleton } from '../../Shared/MultilineSkeleton';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import { Activity } from './Activity/Activity';
import { ActivitySummary } from './ActivitySummary/ActivitySummary';
import { AppointmentResults } from './AppointmentResults/AppointmentResults';
import { CollapsibleEmailList } from './CollapsibleEmailList';
import { CollapsiblePhoneList } from './CollapsiblePhoneList';
import {
  useGetCoachingDonationGraphQuery,
  useLoadAccountListCoachingDetailQuery,
  useLoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import { MonthlyCommitment } from './MonthlyCommitment/MonthlyCommitment';
import { SideContainerText } from './StyledComponents';
import { getLastNewsletter } from './helpers';

export enum CoachingPeriodEnum {
  Weekly = 'Weekly',
  Monthly = 'Monthly',
}

export enum AccountListTypeEnum {
  Own = 'Own',
  Coaching = 'Coaching',
}

interface CoachingDetailProps {
  accountListId: string;
  // Whether the account list belongs to the user or someone that the user coaches
  accountListType: AccountListTypeEnum;
}

const CoachingDetailContainer = styled(Box)(({}) => ({
  width: '100%',
  minHeight: '100%',
  display: 'flex',
}));

const CoachingSideContainer = styled(Box)(({ theme }) => ({
  width: '20rem',
  minHeight: '100%',
  padding: theme.spacing(1),
}));

const CoachingSideTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  margin: theme.spacing(1),
  alignItems: 'center',
  alignContent: 'center',
}));

const CoachingMainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  paddingBottom: theme.spacing(6), // prevent the HelpScout beacon from obscuring content at the bottom
  width: 'calc(100vw - 20rem)',
}));

const CoachingItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  margin: theme.spacing(2),
}));

const CoachingMainTitleContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  margin: theme.spacing(1),
  alignItems: 'center',
  alignContent: 'center',
}));

const CoachingMonthYearButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  color: theme.palette.primary.contrastText,
}));

const SideContainerIcon = styled(AccountCircle)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  accountListId,
  accountListType,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: ownData, loading: ownLoading } =
    useLoadAccountListCoachingDetailQuery({
      variables: { accountListId },
      skip: accountListType !== AccountListTypeEnum.Own,
    });

  const { data: coachingData, loading: coachingLoading } =
    useLoadCoachingDetailQuery({
      variables: { coachingAccountListId: accountListId },
      skip: accountListType !== AccountListTypeEnum.Coaching,
    });

  const loading =
    accountListType === AccountListTypeEnum.Own ? ownLoading : coachingLoading;
  const accountListData =
    accountListType === AccountListTypeEnum.Own
      ? ownData?.accountList
      : coachingData?.coachingAccountList;

  const staffIds = useMemo(
    () =>
      accountListData?.designationAccounts
        .map((account) => account.accountNumber)
        .filter((number) => number.length > 0) ?? [],
    [accountListData],
  );

  const { data: ownDonationGraphData } = useGetDonationGraphQuery({
    variables: {
      accountListId,
    },
    skip: accountListType !== AccountListTypeEnum.Own,
  });

  const { data: coachingDonationGraphData } = useGetCoachingDonationGraphQuery({
    variables: {
      coachingAccountListId: accountListId,
    },
    skip: accountListType !== AccountListTypeEnum.Coaching,
  });

  const donationGraphData =
    accountListType === AccountListTypeEnum.Own
      ? ownDonationGraphData
      : coachingDonationGraphData;

  const { data: taskAnalyticsData } = useGetTaskAnalyticsQuery({
    variables: {
      accountListId,
    },
  });

  const [period, setPeriod] = useState(CoachingPeriodEnum.Weekly);

  const formatOptionalDate = (isoDate: string | null | undefined): string =>
    isoDate ? dateFormat(DateTime.fromISO(isoDate), locale) : t('None');

  return (
    <CoachingDetailContainer>
      <CoachingSideContainer bgcolor={theme.palette.progressBarGray.main}>
        <CoachingSideTitleContainer>
          {/* TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
          <EcoOutlined
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          /> */}
          <SideContainerText variant="h5" display="block">
            {t('Coaching')}
          </SideContainerText>
        </CoachingSideTitleContainer>
        <Divider style={{ background: theme.palette.primary.contrastText }} />
        <CoachingMonthYearButtonGroup
          variant="outlined"
          color="inherit"
          fullWidth
          size="large"
        >
          <Button
            variant={
              period === CoachingPeriodEnum.Weekly ? 'contained' : 'outlined'
            }
            onClick={() => setPeriod(CoachingPeriodEnum.Weekly)}
          >
            {t('Weekly')}
          </Button>
          <Button
            variant={
              period === CoachingPeriodEnum.Monthly ? 'contained' : 'outlined'
            }
            onClick={() => setPeriod(CoachingPeriodEnum.Monthly)}
          >
            {t('Monthly')}
          </Button>
        </CoachingMonthYearButtonGroup>
        <SideContainerText variant="h5" data-testid="Balance">
          {t('Balance:')}{' '}
          {accountListData &&
            currencyFormat(
              accountListData.balance,
              accountListData.currency,
              locale,
            )}
        </SideContainerText>
        <SideContainerText>{t('Staff IDs:')}</SideContainerText>
        <SideContainerText data-testid="StaffIds">
          {staffIds.length ? staffIds.join(', ') : t('None')}
        </SideContainerText>
        <SideContainerText data-testid="LastPrayerLetter">
          {t('Last Prayer Letter:')}{' '}
          {taskAnalyticsData &&
            formatOptionalDate(
              getLastNewsletter(
                taskAnalyticsData.taskAnalytics
                  .lastElectronicNewsletterCompletedAt,
                taskAnalyticsData.taskAnalytics
                  .lastPhysicalNewsletterCompletedAt,
              ),
            )}
        </SideContainerText>
        <Divider style={{ background: theme.palette.primary.contrastText }} />
        <SideContainerText variant="h5" style={{ margin: theme.spacing(1) }}>
          {t('MPD Info')}
        </SideContainerText>
        <SideContainerText data-testid="WeeksOnMpd">
          {t('Weeks on MPD:')} {accountListData?.weeksOnMpd}
        </SideContainerText>
        <SideContainerText data-testid="MpdStartDate">
          {t('Start Date:')}{' '}
          {accountListData &&
            formatOptionalDate(accountListData?.activeMpdStartAt)}
        </SideContainerText>
        <SideContainerText data-testid="MpdEndDate">
          {t('End Date:')}{' '}
          {accountListData &&
            formatOptionalDate(accountListData?.activeMpdFinishAt)}
        </SideContainerText>
        <SideContainerText data-testid="MpdCommitmentGoal">
          {t('Commitment Goal:')}{' '}
          {accountListData &&
            (typeof accountListData.activeMpdMonthlyGoal === 'number'
              ? currencyFormat(
                  accountListData.activeMpdMonthlyGoal,
                  accountListData?.currency,
                  locale,
                )
              : t('None'))}
        </SideContainerText>
        <Divider style={{ background: theme.palette.primary.contrastText }} />
        <SideContainerText variant="h5" style={{ margin: theme.spacing(1) }}>
          {t('Users')}
        </SideContainerText>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          accountListData?.users.nodes.map((user) => (
            <Fragment key={user.id}>
              <SideContainerIcon />
              <SideContainerText>
                {user.firstName + ' ' + user.lastName}
              </SideContainerText>
              <CollapsibleEmailList emails={user.emailAddresses.nodes} />
              <CollapsiblePhoneList phones={user.phoneNumbers.nodes} />
              <Divider style={{ margin: theme.spacing(1) }} />
            </Fragment>
          ))
        )}
        <Divider style={{ background: theme.palette.primary.contrastText }} />
        <SideContainerText variant="h5" style={{ margin: theme.spacing(1) }}>
          {t('Coaches')}
        </SideContainerText>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          accountListData?.coaches.nodes.map((coach) => (
            <Fragment key={coach.id}>
              <SideContainerIcon />
              <SideContainerText>
                {coach.firstName + ' ' + coach.lastName}
              </SideContainerText>
              <CollapsibleEmailList emails={coach.emailAddresses.nodes} />
              <CollapsiblePhoneList phones={coach.phoneNumbers.nodes} />
              <Divider style={{ margin: theme.spacing(1) }} />
            </Fragment>
          ))
        )}
      </CoachingSideContainer>
      <CoachingMainContainer>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          <>
            <CoachingMainTitleContainer>
              <Box style={{ flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  display="block"
                  style={{
                    margin: theme.spacing(1),
                  }}
                >
                  {accountListData?.name}
                </Typography>
              </Box>
              <Box style={{ flexGrow: 1 }}>
                <AppealProgress
                  loading={ownLoading}
                  isPrimary={false}
                  currency={accountListData?.currency}
                  goal={accountListData?.monthlyGoal ?? undefined}
                  received={accountListData?.receivedPledges}
                  pledged={accountListData?.totalPledges}
                />
              </Box>
            </CoachingMainTitleContainer>
            <Divider />
            <CoachingItemContainer>
              <DonationHistories
                goal={accountListData?.monthlyGoal ?? undefined}
                pledged={accountListData?.totalPledges}
                reportsDonationHistories={
                  donationGraphData?.reportsDonationHistories
                }
                currencyCode={accountListData?.currency}
              />
              <MonthlyCommitment
                coachingId={accountListId}
                currencyCode={accountListData?.currency}
                goal={accountListData?.monthlyGoal ?? 0}
              />
              <AppointmentResults
                accountListId={accountListId}
                currency={accountListData?.currency}
                period={period}
              />
              <ActivitySummary accountListId={accountListId} period={period} />
              <Activity
                accountListId={accountListId}
                accountListType={accountListType}
                period={period}
                currency={accountListData?.currency}
                primaryAppeal={accountListData?.primaryAppeal ?? undefined}
              />
            </CoachingItemContainer>
          </>
        )}
      </CoachingMainContainer>
    </CoachingDetailContainer>
  );
};

export default CoachingDetail;
