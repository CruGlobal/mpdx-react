import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FunctionsIcon from '@mui/icons-material/Functions';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PrimaryBudgetCategory } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useUpdatePrimaryBudgetCategoryMutation } from './PrimaryBudgetCategory.generated';
import { StyledGrid } from './StyledGrid';
import {
  useCreateSubBudgetCategoryMutation,
  useDeleteSubBudgetCategoryMutation,
  useUpdateSubBudgetCategoryMutation,
} from './SubBudgetCategory.generated';
import { validateRowData } from './gridErrorHelpers';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const ErrorCell = styled(Box)(({ theme }) => ({
  height: '100%',
  border: `2px solid ${theme.palette.error.main}`,
}));

interface GoalCalculatorGridProps {
  category: PrimaryBudgetCategory;
  promptText?: string;
}

export const GoalCalculatorGrid: React.FC<GoalCalculatorGridProps> = ({
  category,
  promptText,
}) => {
  const { t } = useTranslation();

  const [gridData, setGridData] = useState(
    (category.subBudgetCategories || []).map((subCategory) => ({
      id: subCategory.id,
      label: subCategory.label,
      amount: subCategory.amount,
    }))
  );
  const [lumpSumAmount, setLumpSumAmount] = useState(category.directInput || 0);
  const [cellErrors, setCellErrors] = useState<Record<string, string[]>>({});

  return (
    <>
      {promptText && <Typography sx={{ mb: 2 }}>{t(promptText)}</Typography>}
      <GoalCalculatorGridForm
        category={category}
        gridData={gridData}
        setGridData={setGridData}
        lumpSumAmount={lumpSumAmount}
        setLumpSumAmount={setLumpSumAmount}
        cellErrors={cellErrors}
        setCellErrors={setCellErrors}
      />
    </>
  );
};

interface GoalCalculatorGridFormProps {
  category: PrimaryBudgetCategory;
  gridData: Array<{
    id: string;
    label: string;
    amount: number;
  }>;
  setGridData: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        label: string;
        amount: number;
      }>
    >
  >;
  lumpSumAmount: number;
  setLumpSumAmount: React.Dispatch<React.SetStateAction<number>>;
  cellErrors: Record<string, string[]>;
  setCellErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const GoalCalculatorGridForm: React.FC<GoalCalculatorGridFormProps> = ({
  category,
  gridData,
  setGridData,
  lumpSumAmount,
  setLumpSumAmount,
  cellErrors,
  setCellErrors,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { label: categoryName, directInput: categoryDirectInput } = category;
  const accountListId = useAccountListId() ?? '';
  const [updatePrimaryBudgetCategory] =
    useUpdatePrimaryBudgetCategoryMutation();
  const [updateSubBudgetCategory] = useUpdateSubBudgetCategoryMutation();
  const [createSubBudgetCategory] = useCreateSubBudgetCategoryMutation();
  const [deleteSubBudgetCategory] = useDeleteSubBudgetCategoryMutation();

  const totalAmount = gridData.reduce((sum, item) => sum + item.amount, 0);

  const dataWithTotal = [
    ...gridData,
    { id: 'total', label: 'Total', amount: totalAmount },
  ];

  const [directInput, setDirectInput] = useState(!!categoryDirectInput);

  const debouncedUpdateMutation = useDebouncedCallback(
    (value: number | null) => {
      updatePrimaryBudgetCategory({
        variables: {
          input: {
            accountListId,
            id: category.id,
            directInput: value,
          },
        },
      });
    },
    500
  );

  const handleDirectInputToggle = (enableDirectInput: boolean) => {
    const valueToSet = enableDirectInput ? lumpSumAmount || totalAmount : null;
    setDirectInput(enableDirectInput);
    debouncedUpdateMutation(valueToSet);
  };

  const handleLumpSumChange = (value: string | number) => {
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value;
    setLumpSumAmount(numericValue);
    debouncedUpdateMutation(numericValue);
  };

  const addExpense = () => {
    createSubBudgetCategory({
      variables: {
        input: {
          accountListId,
          attributes: {
            primaryBudgetCategoryId: category.id,
            label: t('New Income'),
            amount: 0,
          },
        },
      },
      onCompleted: (result) => {
        if (result.createSubBudgetCategory?.subBudgetCategory) {
          const serverCategory =
            result.createSubBudgetCategory.subBudgetCategory;
          const newIncomeItem = {
            id: serverCategory.id,
            label: serverCategory.label,
            amount: serverCategory.amount,
          };
          const updatedData = [...gridData, newIncomeItem];
          setGridData(updatedData);
        }
      },
    });
  };

  const handleDelete = (id: string | number) => {
    const rowId = id.toString();

    deleteSubBudgetCategory({
      variables: {
        input: {
          accountListId,
          id: rowId,
        },
      },
      onCompleted: () => {
        const updatedData = gridData.filter((item) => item.id !== rowId);
        setGridData(updatedData);
      },
    });
  };

  const processRowUpdate = (newRow: GridValidRowModel) => {
    if (newRow.id === 'total') {
      return newRow;
    }

    const rowId = newRow.id as string;
    const label = newRow.label as string;
    const amount = newRow.amount as number;
    const validationResult = validateRowData(rowId, label, amount);

    if (validationResult.hasErrors) {
      setCellErrors((prev) => ({
        ...prev,
        ...validationResult.errors,
      }));
      return newRow;
    }

    setCellErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${rowId}-label`];
      delete updated[`${rowId}-amount`];
      return updated;
    });

    const updatedData = gridData.map((item) =>
      item.id === newRow.id
        ? {
            ...item,
            label: newRow.label as string,
            amount: newRow.amount as number,
          }
        : item
    );

    setGridData(updatedData);

    updateSubBudgetCategory({
      variables: {
        input: {
          accountListId,
          attributes: {
            id: newRow.id as string,
            label: newRow.label as string,
            amount: newRow.amount as number,
          },
        },
      },
    });

    return newRow;
  };

  const renderLabelCell = (params: GridRenderCellParams) => {
    const cellKey = `${params.id}-label`;
    const hasError = cellErrors[cellKey];

    if (hasError) {
      return <ErrorCell title={hasError[0]}>{params.value}</ErrorCell>;
    }

    return params.value;
  };

  const renderAmountCell = (params: GridRenderCellParams) => {
    const cellKey = `${params.id}-amount`;
    const hasError = cellErrors[cellKey];
    const formattedValue = currencyFormat(params.value, 'USD', locale);

    if (hasError) {
      return <ErrorCell title={hasError[0]}>{formattedValue}</ErrorCell>;
    }

    return formattedValue;
  };

  const columns: GridColDef[] = [
    {
      field: 'label',
      headerName: t('Expense Name'),
      flex: 1,
      minWidth: 200,
      editable: true,
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
      renderCell: renderAmountCell,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 60,
      getActions: (params) => {
        // Don't show delete action for total row
        if (params.id === 'total') {
          return [];
        }

        return [
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.id)}
            showInMenu={false}
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="span" sx={{ mr: 2 }}>
          {categoryName}
        </Typography>

        <ButtonGroup sx={{ mb: 1 }}>
          <Button
            variant={directInput ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleDirectInputToggle(true)}
            startIcon={<FunctionsIcon />}
          >
            {t('Lump Sum')}
          </Button>
          <Button
            size="small"
            variant={!directInput ? 'contained' : 'outlined'}
            onClick={() => handleDirectInputToggle(false)}
            startIcon={<ViewHeadlineIcon />}
          >
            {t('Line Item')}
          </Button>
        </ButtonGroup>
      </Box>
      <StyledCard>
        {directInput ? (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('Total')}
              type="number"
              value={lumpSumAmount}
              onChange={(e) => handleLumpSumChange(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        ) : (
          <>
            <Button
              variant="text"
              onClick={addExpense}
              size="small"
              startIcon={<AddIcon />}
            >
              {t('Add Line Item')}
            </Button>

            <Box>
              <StyledGrid
                rows={dataWithTotal}
                columns={columns}
                processRowUpdate={processRowUpdate}
              />
            </Box>
          </>
        )}
      </StyledCard>
    </>
  );
};
