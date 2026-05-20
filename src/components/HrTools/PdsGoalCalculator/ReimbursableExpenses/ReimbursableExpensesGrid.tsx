import React, { useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Card,
  FormHelperText,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { BaseGrid } from '../../GoalCalculator/SharedComponents/GoalCalculatorGrid/BaseGrid';
import { useSaveField } from '../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { ReimbursableCalculationFields } from '../calculations/reimbursableExpenses';

export type ReimbursableFieldName = keyof ReimbursableCalculationFields;

export interface ReimbursableField {
  fieldName: ReimbursableFieldName;
  label: string;
  max?: number;
  tooltip?: string;
}

interface ReimbursableRow {
  id: ReimbursableFieldName | 'total';
  label: string;
  amount: number;
  tooltip?: string;
}

interface ReimbursableExpensesGridProps {
  title: string;
  description?: string;
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
  gap: theme.spacing(0.5),
  color: theme.palette.error.main,
}));

export const ReimbursableExpensesGrid: React.FC<
  ReimbursableExpensesGridProps
> = ({
  title,
  description,
  fields,
  subtotalLabel,
  subtotalValue,
  subtotalTestId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const { calculation } = usePdsGoalCalculator();
  const saveField = useSaveField();
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});

  if (!calculation) {
    return null;
  }

  const rows: ReimbursableRow[] = [
    ...fields.map((field) => ({
      id: field.fieldName,
      label: field.label,
      amount: calculation[field.fieldName] ?? 0,
      tooltip: field.tooltip,
    })),
    { id: 'total', label: subtotalLabel, amount: subtotalValue },
  ];

  const processRowUpdate = async (newRow: ReimbursableRow) => {
    const field = fields.find((f) => f.fieldName === newRow.id);
    if (!field) {
      return newRow;
    }

    const cellKey = `${field.fieldName}-amount`;

    if (newRow.amount < 0) {
      setCellErrors((prev) => ({
        ...prev,
        [cellKey]: t('Amount must be positive'),
      }));
      return newRow;
    }

    let amount = newRow.amount;
    if (field.max !== undefined && newRow.amount > field.max) {
      amount = field.max;
      enqueueSnackbar(
        t('{{label}} reduced to its maximum of {{max}}.', {
          label: field.label,
          max: currencyFormat(field.max, 'USD', locale),
        }),
        { variant: 'info' },
      );
    }

    setCellErrors((prev) => {
      if (!(cellKey in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[cellKey];
      return next;
    });

    await saveField({ [field.fieldName]: amount });

    return { ...newRow, amount };
  };

  const renderLabelCell = (params: GridRenderCellParams<ReimbursableRow>) => {
    const { row } = params;
    if (!row.tooltip) {
      return row.label;
    }
    return (
      <Stack direction="row" alignItems="center" gap={0.5}>
        <span>{row.label}</span>
        <Tooltip title={row.tooltip}>
          <IconButton
            size="small"
            aria-label={row.tooltip}
            disableRipple
            sx={{ p: 0 }}
          >
            <InfoIcon color="action" fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  const renderAmountCell = (params: GridRenderCellParams<ReimbursableRow>) => {
    const cellKey = `${params.id}-amount`;
    const error = cellErrors[cellKey];
    const formatted = currencyFormat(params.value ?? 0, 'USD', locale);

    if (error) {
      return (
        <ErrorCell>
          <ErrorOutlineIcon fontSize="small" aria-hidden="true" />
          <span>{formatted}</span>
        </ErrorCell>
      );
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
      renderCell: renderLabelCell,
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
      <Box pb={2}>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" pt={0.5}>
            {description}
          </Typography>
        )}
      </Box>
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
