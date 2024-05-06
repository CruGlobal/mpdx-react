import React, { Fragment, useMemo } from 'react';
// TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { GetTaskAnalyticsQuery } from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { CollapsibleEmailList } from '../../Shared/CollapsibleContactInfo/CollapsibleEmailList';
import { CollapsiblePhoneList } from '../../Shared/CollapsibleContactInfo/CollapsiblePhoneList';
import { MultilineSkeleton } from '../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from './CoachingDetail';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import { getLastNewsletter } from './helpers';

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '20rem',
  height: '100%',
  backgroundColor: theme.palette.progressBarGray.main,
  color: theme.palette.primary.contrastText,
  '.MuiLink-root': {
    color: theme.palette.primary.contrastText,
  },
  '.MuiTypography-body1': {
    margin: theme.spacing(0, 1),
  },
}));

const TitleContainer = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const ContrastDivider = styled(Divider)({
  background: 'currentcolor',
});

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'scroll',
  padding: theme.spacing(0, 1),
});

const MonthlyWeeklyButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  color: theme.palette.primary.contrastText,
}));

const SectionHeaderText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledUserIcon = styled(AccountCircleIcon)(({ theme }) => ({
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
    <Container>
      <TitleContainer>
        {/* TODO: EcoOutlined is not defined on @mui/icons-material, find replacement.
          <EcoOutlined
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          /> */}
        <Typography variant="h5" flex={1}>
          {t('Coaching')}
        </Typography>
        {showClose && (
          <IconButton onClick={handleClose} aria-label={t('Close')}>
            <CloseIcon />
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
        <Typography>{t('Staff IDs:')}</Typography>
        <Typography data-testid="StaffIds">
          {staffIds.length ? staffIds.join(', ') : t('None')}
        </Typography>
        <Typography data-testid="LastPrayerLetter">
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
        </Typography>
        <ContrastDivider />
        <SectionHeaderText variant="h5">{t('MPD Info')}</SectionHeaderText>
        <Typography data-testid="WeeksOnMpd">
          {t('Weeks on MPD:')} {accountListData?.weeksOnMpd}
        </Typography>
        <Typography data-testid="MpdStartDate">
          {t('Start Date:')}{' '}
          {accountListData &&
            formatOptionalDate(accountListData?.activeMpdStartAt)}
        </Typography>
        <Typography data-testid="MpdEndDate">
          {t('End Date:')}{' '}
          {accountListData &&
            formatOptionalDate(accountListData?.activeMpdFinishAt)}
        </Typography>
        <Typography data-testid="MpdCommitmentGoal">
          {t('Commitment Goal:')}{' '}
          {accountListData &&
            (typeof accountListData.activeMpdMonthlyGoal === 'number'
              ? currencyFormat(
                  accountListData.activeMpdMonthlyGoal,
                  accountListData?.currency,
                  locale,
                )
              : t('None'))}
        </Typography>
        <ContrastDivider />
        <SectionHeaderText variant="h5">{t('Users')}</SectionHeaderText>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          accountListData?.users.nodes.map((user) => (
            <Fragment key={user.id}>
              <StyledUserIcon />
              <Typography>{user.firstName + ' ' + user.lastName}</Typography>
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
              <Typography>{coach.firstName + ' ' + coach.lastName}</Typography>
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
