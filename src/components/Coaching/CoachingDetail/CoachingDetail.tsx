import React from 'react';
import { Box, Divider, styled, Typography } from '@material-ui/core';
import { EcoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import { useLoadCoachingDetailQuery } from './LoadCoachingDetail.generated';
import theme from 'src/theme';
import { MonthlyActivitySection } from 'src/components/Reports/DonationsReport/MonthlyActivity/MonthlyActivitySection';

interface CoachingDetailProps {
  coachingId: string;
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

const CoachingMainTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1),
  alignItems: 'center',
  alignContent: 'center',
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  coachingId,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useLoadCoachingDetailQuery({
    variables: { coachingId: coachingId },
  });

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
      </CoachingSideContainer>
      <CoachingMainContainer>
        {loading ? (
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
                  {data?.accountList.name}
                </Typography>
              </Box>
              <Box style={{ flexGrow: 1 }}>
                <AppealProgress
                  loading={loading}
                  isPrimary={false}
                  currency={data?.accountList.currency}
                  goal={
                    data?.accountList.monthlyGoal
                      ? data.accountList.monthlyGoal
                      : 0
                  }
                  received={data?.accountList.receivedPledges}
                  pledged={data?.accountList.totalPledges}
                />
              </Box>
            </CoachingMainTitleContainer>
            <Divider />
            {data?.accountList.id ? (
              <MonthlyActivitySection accountListId={data.accountList.id} />
            ) : (
              <></>
            )}
          </>
        )}
      </CoachingMainContainer>
    </CoachingDetailContainer>
  );
};

export default CoachingDetail;
