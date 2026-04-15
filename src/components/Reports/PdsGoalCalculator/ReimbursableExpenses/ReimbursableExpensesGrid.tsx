import React, { useState } from 'react';
import { Box, Card, FormHelperText, Typography, styled } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { BaseGrid } from 'src/components/Reports/GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useSaveField } from '../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { ReimbursableCalculationFields } from './reimbursableExpenses';

export type ReimbursableFieldName = keyof ReimbursableCalculationFields;

export interface ReimbursableField {
  fieldName: ReimbursableFieldName;
  label: string;
  max?: number;
}

interface ReimbursableRow {
  id: ReimbursableFieldName | 'total';
  label: string;
  amount: number;
}

interface ReimbursableExpensesGridProps {
  title: string;
  fields: ReimbursableField[];
  subtotalLabel: string;
  subtotalValue: number;
  subtotalTestId?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const ErrorCell = styled(Box)(({ theme }) => ({
  height: '100%',
  border: `2px solid ${theme.palette.error.main}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ReimbursableExpensesGrid: React.FC<
  ReimbursableExpensesGridProps
> = ({ title, fields, subtotalLabel, subtotalValue, subtotalTestId }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation } = usePdsGoalCalculator();
  const saveField = useSaveField();
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});

  if (!calculation) {
    return null;
  }

  const validateAmount = (field: ReimbursableField, amount: number) => {
    if (amount < 0) {
      return t('Amount must be positive');
    }
    if (field.max !== undefined && amount > field.max) {
      return t('Amount cannot exceed {{max}}', {
        max: currencyFormat(field.max, 'USD', locale),
      });
    }
    return null;
  };

  const rows: ReimbursableRow[] = [
    ...fields.map((field) => ({
      id: field.fieldName,
      label: field.label,
      amount: calculation[field.fieldName] ?? 0,
    })),
    { id: 'total', label: subtotalLabel, amount: subtotalValue },
  ];

  const processRowUpdate = async (newRow: ReimbursableRow) => {
    const field = fields.find((f) => f.fieldName === newRow.id);
    if (!field) {
      return newRow;
    }

    const { amount } = newRow;
    const cellKey = `${field.fieldName}-amount`;
    const error = validateAmount(field, amount);

    setCellErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[cellKey] = error;
      } else {
        delete next[cellKey];
      }
      return next;
    });

    if (!error) {
      await saveField({ [field.fieldName]: amount });
    }

    return newRow;
  };

  const renderAmountCell = (params: GridRenderCellParams<ReimbursableRow>) => {
    const cellKey = `${params.id}-amount`;
    const error = cellErrors[cellKey];
    const formatted = currencyFormat(params.value ?? 0, 'USD', locale);

    if (error) {
      return <ErrorCell title={error}>{formatted}</ErrorCell>;
    }

    if (params.id === 'total' && subtotalTestId) {
      return <span data-testid={subtotalTestId}>{formatted}</span>;
    }

    return formatted;
  };

  const columns: GridColDef<ReimbursableRow>[] = [
    {
      field: 'label',
      headerName: t('Expense Name'),
      flex: 1,
      minWidth: 200,
      sortable: false,
    },
    {
      field: 'amount',
      headerName: t('Amount'),
      flex: 1,
      minWidth: 150,
      editable: true,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: renderAmountCell,
    },
  ];

  return (
    <>
      <Typography variant="h6" pb={2}>
        {title}
      </Typography>
      <StyledCard>
        <BaseGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
        />
      </StyledCard>
      {Object.entries(cellErrors).map(([cellKey, error]) => (
        <FormHelperText key={cellKey} error role="alert" sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      ))}
    </>
  );
};
