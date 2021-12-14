import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  styled,
  Typography,
} from '@material-ui/core';
import { EcoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import {
  useLoadAccountListCoachingDetailQuery,
  useLoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import theme from 'src/theme';
import { MonthlyActivitySection } from 'src/components/Reports/DonationsReport/MonthlyActivity/MonthlyActivitySection';

interface CoachingDetailProps {
  coachingId: string;
  isAccountListId: boolean;
}

const CoachingLoadingSkeleton = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  margin: theme.spacing(1),
}));

const CoachingDetailContainer = styled(Box)(({}) => ({
  width: '100&',
  minHeight: '100%',
  display: 'flex',
}));

const CoachingSideContainer = styled(Box)(({ theme }) => ({
  minHeight: '100%',
  flexGrow: 1,
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
  flexGrow: 4,
}));

const CoachingItemContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
}));

const CoachingMainTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1),
  alignItems: 'center',
  alignContent: 'center',
}));

const CoachingMonthYearButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(1),
  color: theme.palette.primary.contrastText,
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  coachingId,
  isAccountListId = false,
}) => {
  const { t } = useTranslation();
  const {
    data: accountListData,
    loading,
  } = useLoadAccountListCoachingDetailQuery({
    variables: { coachingId },
    skip: !isAccountListId,
  });

  const {
    data: coachingData,
    loading: coachingLoading,
  } = useLoadCoachingDetailQuery({
    variables: { coachingId },
    skip: isAccountListId,
  });

  const data = isAccountListId
    ? accountListData?.accountList
    : coachingData?.coachingAccountList;

  const { isMonthly, setIsMonthly } = React.useState(true);
  return (
    <CoachingDetailContainer>
      <CoachingSideContainer bgcolor={theme.palette.progressBarGray.main}>
        <CoachingSideTitleContainer>
          <EcoOutlined
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          />
          <Typography
            variant="h5"
            display="block"
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          >
            {t('Coaching')}
          </Typography>
        </CoachingSideTitleContainer>
        <Divider style={{ background: theme.palette.primary.contrastText }} />
        <CoachingMonthYearButtonGroup
          variant="outlined"
          color="inherit"
          size="large"
        >
          <Button variant="contained">{t('Monthly')}</Button>
          <Button variant="outlined">{t('Yearly')}</Button>
        </CoachingMonthYearButtonGroup>
      </CoachingSideContainer>
      <CoachingMainContainer>
        {loading || coachingLoading ? (
          <>
            <CoachingLoadingSkeleton />
            <CoachingLoadingSkeleton />
            <CoachingLoadingSkeleton />
            <CoachingLoadingSkeleton />
          </>
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
                  {data?.name}
                </Typography>
              </Box>
              <Box style={{ flexGrow: 1 }}>
                <AppealProgress
                  loading={loading}
                  isPrimary={false}
                  currency={data?.currency}
                  goal={data?.monthlyGoal ?? 0}
                  received={data?.receivedPledges}
                  pledged={data?.totalPledges}
                />
              </Box>
            </CoachingMainTitleContainer>
            <Divider />
            <CoachingItemContainer>
              {/*
                TODO: MonthlyActivitySection doesn't work if coaching is not one of the 
                Accountlists. reportDonationsHistories is required for this View and it doesn't 
                work with coaching.
              */}
              <MonthlyActivitySection accountListId={coachingId} />
            </CoachingItemContainer>
          </>
        )}
      </CoachingMainContainer>
    </CoachingDetailContainer>
  );
};

export default CoachingDetail;
