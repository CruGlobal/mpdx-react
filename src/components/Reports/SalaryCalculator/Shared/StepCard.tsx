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
    padding: theme.spacing(3),
  },
  '.MuiCardContent-root': {
    padding: theme.spacing(2),
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
  const { hcm } = useSalaryCalculator();

  const [self, spouse] = hcm ?? [];
  const hasSpouse = hcm?.length === 2;

  return (
    <TableHead>
      <TableRow>
        <TableCell scope="col">{t('Category')}</TableCell>
        <TableCell scope="col">{self?.staffInfo.firstName}</TableCell>
        {hasSpouse && (
          <TableCell scope="col">{spouse?.staffInfo.firstName}</TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};
