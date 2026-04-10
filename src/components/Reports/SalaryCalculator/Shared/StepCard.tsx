import React from 'react';
import { Card, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const StepCard = styled(Card)(({ theme }) => ({
  '.MuiCardHeader-root': {
    padding: theme.spacing(3, 2),
  },
  '.MuiCardContent-root': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    '> .MuiDivider-root': {
      marginBlock: theme.spacing(2),
    },
  },
  '.MuiTable-root': {
    tableLayout: 'fixed',
  },
  '.MuiTableCell-head.MuiTableCell-root': {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  '.MuiTableCell-head.MuiTableCell-root:first-of-type': {
    width: '50%',
  },
  '.MuiTableCell-root': {
    padding: theme.spacing(2),
  },
}));

export const StepTableHead: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse } = useSalaryCalculator();

  return (
    <TableHead>
      <TableRow>
        <TableCell scope="col">{t('Category')}</TableCell>
        <TableCell scope="col">{hcmUser?.staffInfo.preferredName}</TableCell>
        {hcmSpouse && (
          <TableCell scope="col">{hcmSpouse.staffInfo.preferredName}</TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};
