import React, { Fragment, useMemo } from 'react';
import { Box, Button, ButtonGroup, Divider, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { GetTaskAnalyticsQuery } from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import theme from 'src/theme';
import { currencyFormat } from 'src/lib/intlFormat';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';
import { useLocale } from 'src/hooks/useLocale';
import { MultilineSkeleton } from '../../Shared/MultilineSkeleton';
import { SideContainerText } from './StyledComponents';
import { CollapsibleEmailList } from './CollapsibleEmailList';
import { CollapsiblePhoneList } from './CollapsiblePhoneList';
import { getLastNewsletter } from './helpers';
import { CoachingPeriodEnum } from './CoachingDetail';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';

const CoachingSideContainer = styled(Box)(({ theme }) => ({
  width: '20rem',
  minHeight: '100%',
  padding: theme.spacing(1),
}));

const CoachingSideTitleContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const CoachingMonthYearButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  color: theme.palette.primary.contrastText,
}));

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

const SideContainerIcon = styled(AccountCircleIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

interface CoachingSidebarProps {
  period: CoachingPeriodEnum;
  setPeriod: React.Dispatch<React.SetStateAction<CoachingPeriodEnum>>;
  showClose: boolean;
  handleClose: () => void;
  loading: boolean;
  accountListData:
    | LoadCoachingDetailQuery['coachingAccountList']
    | LoadAccountListCoachingDetailQuery['accountList']
    | undefined;
  taskAnalyticsData: GetTaskAnalyticsQuery | undefined;
}

export const CoachingSidebar: React.FC<CoachingSidebarProps> = ({
  period,
  setPeriod,
  showClose,
  handleClose,
  loading,
  accountListData,
  taskAnalyticsData,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const staffIds = useMemo(
    () =>
      accountListData?.designationAccounts
        .map((account) => account.accountNumber)
        .filter((number) => number.length > 0) ?? [],
    [accountListData],
  );

  const formatOptionalDate = (isoDate: string | null | undefined): string =>
    isoDate ? dateFormat(DateTime.fromISO(isoDate), locale) : t('None');

  return (
    <CoachingSideContainer bgcolor={theme.palette.progressBarGray.main}>
      <CoachingSideTitleContainer>
        {/* TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
          <EcoOutlined
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          /> */}
        <SideContainerText variant="h5" flex={1}>
          {t('Coaching')}
        </SideContainerText>
        {showClose && (
          <IconButton onClick={handleClose} aria-label={t('Close')}>
            <StyledCloseIcon />
          </IconButton>
        )}
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
              taskAnalyticsData.taskAnalytics.lastPhysicalNewsletterCompletedAt,
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
  );
};
