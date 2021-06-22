import React from 'react';
import { Container, Grid, Box, Link } from '@material-ui/core';
import { motion } from 'framer-motion';

import { Object } from 'lodash';
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
    partner: [],
    amount: string,
    foreignAmount: string,
    designation: string,
    method: string,
    id: string,
  ) {
    return {
      date,
      partnerId,
      partner,
      amount,
      foreignAmount,
      designation,
      method,
      id,
    };
  }

  const rows = [
    createData(
      '05/07/2011',
      'Bob',
      [<Link>Bob</Link>],
      '100 CAD',
      '100 CAD',
      'You',
      'bank_trans',
      '1',
    ),
    createData(
      '01/27/2021',
      'Bob',
      'Joe',
      '34 CAD',
      '34 CAD',
      'You',
      'bank_trans',
      '2,',
    ),
    createData(
      '02/09/2021',
      'Bob',
      'Larry',
      '2 CAD',
      '2 CAD',
      'You',
      'bank_trans',
      '3',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Carl',
      '234 CAD',
      '234 CAD',
      'You',
      'bank_trans',
      '4',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Jared',
      '55 CAD',
      '55 CAD',
      'You',
      'bank_trans',
      '5',
    ),
    createData(
      '06/07/2021',
      'Bob',
      'Luke',
      '354 CAD',
      '354 CAD',
      'You',
      'bank_trans',
      '6',
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
