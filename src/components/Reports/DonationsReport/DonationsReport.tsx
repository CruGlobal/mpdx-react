import React from 'react';
import { Container, Grid, Box } from '@material-ui/core';
import { motion } from 'framer-motion';
import { GetDashboardQuery } from '../../../../pages/accountLists/GetDashboard.generated';
import { MonthlyActivitySection } from './MonthlyActivitySection';
import { DonationsReportTable } from './DonationsReportTable';

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

export const DonationsReport: React.FC<Props> = ({ data, accountListId }) => {
  function createData(
    date: string,
    partnerId: string,
    partner: string,
    amount: string,
    foreignAmount: string,
    designation: string,
    method: string,
  ) {
    return {
      date,
      partnerId,
      partner,
      amount,
      foreignAmount,
      designation,
      method,
    };
  }

  const rows = [
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Bob',
      '100 CAD',
      '100 CAD',
      'Blank',
      'bank_trans',
    ),
  ];
  return (
    <Box py={5}>
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <MonthlyActivitySection data={data} />
          <DonationsReportTable data={rows} accountListId="abc" empty={false} />
        </motion.div>
      </Container>
    </Box>
  );
};
