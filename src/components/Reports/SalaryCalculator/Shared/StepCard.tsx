import React from 'react';
import {
  Card,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
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
    '> .MuiTypography-root': {
      paddingLeft: theme.spacing(1),
    },
    '> .MuiDivider-root': {
      marginBlock: theme.spacing(2),
    },
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

interface FormattedTableCellProps extends Omit<TableCellProps, 'children'> {
  value: React.ReactNode;
  percentage?: boolean;
}

export const FormattedTableCell: React.FC<FormattedTableCellProps> = ({
  value,
  percentage,
  ...props
}) => {
  const locale = useLocale();
  const formattedValue =
    typeof value === 'number'
      ? percentage
        ? percentageFormat(value / 100, locale, {
            fractionDigits: 2,
          })
        : currencyFormat(value, 'USD', locale, {
            fractionDigits: 0,
          })
      : value;

  return <TableCell {...props}>{formattedValue}</TableCell>;
};

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
