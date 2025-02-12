import React, { useEffect, useState } from 'react';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import {
  Box,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import DonationHistories from 'src/components/Dashboard/DonationHistories';
import { useGetTaskAnalyticsQuery } from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { useGetDonationGraphQuery } from 'src/components/Reports/DonationsReport/GetDonationGraph.generated';
import { ReportsTagHistoriesAssociationEnum } from 'src/graphql/types.generated';
import { MultilineSkeleton } from '../../Shared/MultilineSkeleton';
import { AppealProgress } from '../AppealProgress/AppealProgress';
import { Activity } from './Activity/Activity';
import { CoachingSidebar } from './CoachingSidebar';
import { LevelOfEffort } from './LevelOfEffort/LevelOfEffort';
import {
  useGetCoachingDonationGraphQuery,
  useLoadAccountListCoachingDetailQuery,
  useLoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import { MonthlyCommitment } from './MonthlyCommitment/MonthlyCommitment';
import { OutstandingCommitments } from './OutstandingCommitments/OutstandingCommitments';
import { OutstandingNeeds } from './OutstandingNeeds/OutstandingNeeds';
import { PartnersProgress } from './PartnersProgress/PartnersProgress';
import { TagsSummary } from './TagsSummary/TagsSummary';
import { WeeklyReport } from './WeeklyReport/WeeklyReport';

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

const CoachingDetailContainer = styled(Box)({
  height: `calc(100vh - ${navBarHeight})`,
  display: 'flex',
});

const CoachingMainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  paddingBottom: theme.spacing(6), // prevent the Helpjuice beacon from obscuring content at the bottom
  overflowY: 'scroll',
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
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  accountListId,
  accountListType,
}) => {
  const { t } = useTranslation();

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

  const periodBegin = DateTime.now()
    .startOf('month')
    .minus({ years: 1 })
    .toISODate();

  const { data: ownDonationGraphData } = useGetDonationGraphQuery({
    variables: {
      accountListId,
      periodBegin,
    },
    skip: accountListType !== AccountListTypeEnum.Own,
  });

  const { data: coachingDonationGraphData } = useGetCoachingDonationGraphQuery({
    variables: {
      coachingAccountListId: accountListId,
      periodBegin,
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
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleCloseDrawer = () => setDrawerVisible(false);

  const usersList = accountListData?.users.nodes
    .map((user) => user.firstName + ' ' + user.lastName)
    .join(', ');

  const sidebarDrawer = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('md'),
  );
  useEffect(() => {
    if (sidebarDrawer) {
      handleCloseDrawer();
    }
  }, [sidebarDrawer]);

  const sidebar = (
    <CoachingSidebar
      period={period}
      setPeriod={setPeriod}
      showClose={sidebarDrawer}
      handleClose={handleCloseDrawer}
      loading={loading}
      accountListData={accountListData}
      taskAnalyticsData={taskAnalyticsData}
    />
  );

  return (
    <CoachingDetailContainer>
      <Hidden mdUp>
        <Drawer open={drawerVisible} onClose={handleCloseDrawer}>
          {sidebar}
        </Drawer>
      </Hidden>
      <Hidden mdDown>{sidebar}</Hidden>
      <CoachingMainContainer>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          <>
            <CoachingMainTitleContainer>
              <Box style={{ flexGrow: 1 }}>
                <Typography variant="h5" mx={1}>
                  <Hidden mdUp>
                    <IconButton
                      onClick={() => setDrawerVisible(!drawerVisible)}
                      aria-label={t('Toggle account details')}
                      name={t('Toggle account details')}
                    >
                      <MenuOpenIcon />
                    </IconButton>
                  </Hidden>
                  {accountListData?.name}
                </Typography>
                <Typography mx={1} variant="subtitle1">
                  {usersList}
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
                loading={loading}
                goal={accountListData?.monthlyGoal ?? undefined}
                pledged={accountListData?.totalPledges}
                reportsDonationHistories={
                  donationGraphData?.reportsDonationHistories
                }
                healthIndicatorData={donationGraphData?.healthIndicatorData}
                currencyCode={accountListData?.currency}
              />
              <MonthlyCommitment
                coachingId={accountListId}
                accountListType={accountListType}
                currencyCode={accountListData?.currency}
                mpdInfo={accountListData ?? null}
              />
              <PartnersProgress
                accountListId={accountListId}
                currency={accountListData?.currency}
                period={period}
              />
              <LevelOfEffort accountListId={accountListId} period={period} />
              <TagsSummary
                accountListId={accountListId}
                period={period}
                association={ReportsTagHistoriesAssociationEnum.Tasks}
              />
              <Activity
                accountListId={accountListId}
                accountListType={accountListType}
                period={period}
                currency={accountListData?.currency}
                primaryAppeal={accountListData?.primaryAppeal ?? undefined}
              />
              <OutstandingCommitments
                accountListId={accountListId}
                accountListType={accountListType}
              />
              <OutstandingNeeds
                accountListId={accountListId}
                accountListType={accountListType}
              />
              <WeeklyReport accountListId={accountListId} />
            </CoachingItemContainer>
          </>
        )}
      </CoachingMainContainer>
    </CoachingDetailContainer>
  );
};

export default CoachingDetail;
