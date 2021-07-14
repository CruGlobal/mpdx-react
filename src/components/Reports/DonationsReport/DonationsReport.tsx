import React from 'react';
import { Container, Box } from '@material-ui/core';
import { motion } from 'framer-motion';

import { MonthlyActivitySection } from './MonthlyActivity/MonthlyActivitySection';
import { DonationsReportTable } from './Table/DonationsReportTable';

interface Props {
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

export const DonationsReport: React.FC<Props> = ({ accountListId }) => {
  return (
    <Box py={5}>
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <MonthlyActivitySection accountListId={accountListId} />
          <DonationsReportTable accountListId={accountListId} />
        </motion.div>
      </Container>
    </Box>
  );
};
