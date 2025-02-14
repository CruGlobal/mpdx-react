import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import { Box, Container, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { GetDashboardQuery } from 'pages/accountLists/GetDashboard.generated';
import Balance from './Balance';
import DonationHistories from './DonationHistories';
import MonthlyGoal from './MonthlyGoal/MonthlyGoal';
import ThisWeek from './ThisWeek';
import Welcome from './Welcome';

interface Props {
  data: GetDashboardQuery;
  accountListId: string;
}

const variants = {
  animate: {
    transition: {
      delayChildren: 1,
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Dashboard = ({ data, accountListId }: Props): ReactElement => {
  const { push } = useRouter();

  const handlePeriodClick = (period: DateTime) => {
    push({
      pathname: `/accountLists/${accountListId}/reports/donations`,
      query: {
        month: period.toISODate(),
      },
    });
  };

  return (
    <>
      <Welcome firstName={data.user.firstName ?? undefined} />
      <Box py={5}>
        <Container>
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
          >
            <Grid container spacing={2} alignItems="stretch">
              <Grid xs={12} sm={8} item>
                <MonthlyGoal
                  accountListId={accountListId}
                  goal={data.accountList.monthlyGoal ?? undefined}
                  received={data.accountList.receivedPledges}
                  pledged={data.accountList.totalPledges}
                  totalGiftsNotStarted={data.contacts.totalCount}
                  currencyCode={data.accountList.currency}
                  onDashboard={true}
                />
              </Grid>
              <Grid xs={12} sm={4} item>
                <Balance
                  balance={data.accountList.balance}
                  currencyCode={data.accountList.currency}
                />
              </Grid>
              <Grid xs={12} item>
                <DonationHistories
                  data={data}
                  onPeriodClick={handlePeriodClick}
                />
              </Grid>
              <Grid xs={12} item>
                <ThisWeek accountListId={accountListId} />
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;
