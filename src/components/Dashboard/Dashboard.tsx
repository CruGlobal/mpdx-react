import React, { ReactElement } from 'react';
import { Container, Grid, Box } from '@material-ui/core';
import { motion } from 'framer-motion';
import { GetDashboardQuery } from '../../../pages/accountLists/GetDashboard.generated';
import Welcome from './Welcome';
import MonthlyGoal from './MonthlyGoal/MonthlyGoal';
import Balance from './Balance';
import DonationHistories from './DonationHistories';
import ThisWeek from './ThisWeek';

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
  return (
    <>
      <Welcome firstName={data.user.firstName} />
      <Box py={5}>
        <Container>
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
          >
            <Grid container spacing={3} alignItems="stretch">
              <Grid xs={12} sm={8} item>
                <MonthlyGoal
                  goal={data.accountList.monthlyGoal}
                  received={data.accountList.receivedPledges}
                  pledged={data.accountList.totalPledges}
                  totalGifts={data.contacts.totalCount}
                  currencyCode={data.accountList.currency}
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
                  goal={data.accountList.monthlyGoal}
                  pledged={data.accountList.totalPledges}
                  reportsDonationHistories={data.reportsDonationHistories}
                  currencyCode={data.accountList.currency}
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
