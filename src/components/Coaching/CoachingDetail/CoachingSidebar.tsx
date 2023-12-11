import React, { Fragment, useMemo } from 'react';
// TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, ButtonGroup, Divider, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { GetTaskAnalyticsQuery } from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';
import theme from 'src/theme';
import { MultilineSkeleton } from '../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from './CoachingDetail';
import { CollapsibleEmailList } from './CollapsibleEmailList';
import { CollapsiblePhoneList } from './CollapsiblePhoneList';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import { SideContainerText } from './StyledComponents';
import { getLastNewsletter } from './helpers';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '20rem',
  minHeight: '100vh',
  padding: theme.spacing(0, 1),
}));

const TitleContainer = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const ContrastDivider = styled(Divider)(({ theme }) => ({
  background: theme.palette.primary.contrastText,
}));

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'scroll',
});

const MonthlyWeeklyButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  color: theme.palette.primary.contrastText,
}));

const SectionHeaderText = styled(SideContainerText)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

const StyledUserIcon = styled(AccountCircleIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

const UserDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1),
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
    <Container bgcolor={theme.palette.progressBarGray.main}>
      <TitleContainer>
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
      </TitleContainer>
      <ContrastDivider />
      <ContentContainer>
        <MonthlyWeeklyButtonGroup
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
        </MonthlyWeeklyButtonGroup>
        <SectionHeaderText variant="h5" data-testid="Balance">
          {t('Balance:')}{' '}
          {accountListData &&
            currencyFormat(
              accountListData.balance,
              accountListData.currency,
              locale,
            )}
        </SectionHeaderText>
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
        <ContrastDivider />
        <SectionHeaderText variant="h5">{t('MPD Info')}</SectionHeaderText>
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
        <ContrastDivider />
        <SectionHeaderText variant="h5">{t('Users')}</SectionHeaderText>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          accountListData?.users.nodes.map((user) => (
            <Fragment key={user.id}>
              <StyledUserIcon />
              <SideContainerText>
                {user.firstName + ' ' + user.lastName}
              </SideContainerText>
              <CollapsibleEmailList emails={user.emailAddresses.nodes} />
              <CollapsiblePhoneList phones={user.phoneNumbers.nodes} />
              <UserDivider />
            </Fragment>
          ))
        )}
        <ContrastDivider />
        <SectionHeaderText variant="h5">{t('Coaches')}</SectionHeaderText>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          accountListData?.coaches.nodes.map((coach) => (
            <Fragment key={coach.id}>
              <StyledUserIcon />
              <SideContainerText>
                {coach.firstName + ' ' + coach.lastName}
              </SideContainerText>
              <CollapsibleEmailList emails={coach.emailAddresses.nodes} />
              <CollapsiblePhoneList phones={coach.phoneNumbers.nodes} />
              <UserDivider />
            </Fragment>
          ))
        )}
      </ContentContainer>
    </Container>
  );
};
