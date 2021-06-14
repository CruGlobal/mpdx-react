import React, { useState } from 'react';
import {
  Box,
  Typography,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
}

const BoxWrapper = styled(Box)(({}) => ({
  backgroundColor: '#f0f0f0',
  height: 300,
  minWidth: 700,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const ExpectedMonthlyTotalReportTable: React.FC<Props> = () => {
  const { t } = useTranslation();
  return (
    <BoxWrapper>
      <img src="bill.jpg" alt="bill" style={{ padding: 4 }}></img>
      <Typography variant="h5">
        {t('You have no expected donations this month')}
      </Typography>
    </BoxWrapper>
  );
};
