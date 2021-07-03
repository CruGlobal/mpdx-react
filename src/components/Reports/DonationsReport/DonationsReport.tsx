import React from 'react';
import { Container, Box } from '@material-ui/core';
import { motion } from 'framer-motion';
import { GetDashboardQuery } from '../../../../pages/accountLists/GetDashboard.generated';
import { MonthlyActivitySection } from './MonthlyActivity/MonthlyActivitySection';
import { DonationsReportTable } from './Table/DonationsReportTable';

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
    date: Date,
    partnerId: string,
    partner: string,
    currency: string,
    foreignCurrency: string,
    convertedAmount: number,
    foreignAmount: number,
    designation: string,
    method: string,
    id: string,
  ) {
    return {
      date,
      partnerId,
      partner,
      currency,
      foreignCurrency,
      convertedAmount,
      foreignAmount,
      designation,
      method,
      id,
    };
  }

  const rows = [
    createData(
      new Date(2018, 0, 0o5, 17, 23, 42, 11),
      '00687849-5b74-43dd-86de-e841c6f30fc0',
      'Bob',
      'CAD',
      'USD',
      123.02,
      100,
      'You',
      'bank_trans',
      '1',
    ),
    createData(
      new Date(2019, 0o5, 0o5, 17, 23, 42, 11),
      'Bob',
      'Joe',
      'CAD',
      'EUR',
      73.37,
      50,
      'You',
      'bank_trans',
      '2,',
    ),
    createData(
      new Date(2020, 0o5, 0o5, 17, 23, 42, 11),
      'Bob',
      'Larry',
      'CAD',
      'CAD',
      2,
      2,
      'You',
      'bank_trans',
      '3',
    ),
    createData(
      new Date(2021, 0o5, 0o5, 17, 23, 42, 11),
      'Bob',
      'Carl',
      'CAD',
      'CAD',
      234,
      234,
      'You',
      'bank_trans',
      '4',
    ),
    createData(
      new Date(2018, 0o5, 0o5, 17, 23, 42, 11),
      'Bob',
      'Jared',
      'CAD',
      'CAD',
      55,
      55,
      'You',
      'bank_trans',
      '5',
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
          <DonationsReportTable data={rows} accountListId={accountListId} />
        </motion.div>
      </Container>
    </Box>
  );
};
