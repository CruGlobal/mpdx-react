import React, { useState } from 'react';
import { gql } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import FunctionsIcon from '@mui/icons-material/Functions';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  FormHelperText,
  IconButton,
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
import { validateDirectInput, validateRowData } from './gridErrorHelpers';

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
  rightPanelContent?: JSX.Element;
  promptText?: string;
}

export const GoalCalculatorGrid: React.FC<GoalCalculatorGridProps> = ({
  category,
  rightPanelContent,
  promptText,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { label: categoryName } = category;
  const accountListId = useAccountListId() ?? '';
  const { setRightPanelContent } = useGoalCalculator();

  const gridData = (category.subBudgetCategories || []).map((subCategory) => ({
    id: subCategory.id,
    label: subCategory.label,
    amount: subCategory.amount,
    canDelete: !subCategory.category,
  }));

  const totalAmount = gridData.reduce((sum, item) => sum + item.amount, 0);
  const [cellErrors, setCellErrors] = useState<Record<string, string[]>>({});
  const [directInputError, setDirectInputError] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [updatePrimaryBudgetCategory] =
    useUpdatePrimaryBudgetCategoryMutation();
  const [updateSubBudgetCategory] = useUpdateSubBudgetCategoryMutation();
  const [createSubBudgetCategory] = useCreateSubBudgetCategoryMutation();
  const [deleteSubBudgetCategory] = useDeleteSubBudgetCategoryMutation();

  const dataWithTotal = [
    ...gridData,
    { id: 'total', label: 'Total', amount: totalAmount },
  ];

  const directInput = !!category.directInput;
  const lumpSumAmount = category.directInput || 0;

  const updatePrimaryBudgetCategoryMutation = (value: number | null) => {
    updatePrimaryBudgetCategory({
      variables: {
        input: {
          accountListId,
          id: category.id,
          directInput: value,
        },
      },
      optimisticResponse: {
        updatePrimaryBudgetCategory: {
          __typename: 'PrimaryBudgetCategoryUpdateMutationPayload',
          primaryBudgetCategory: {
            ...category,
            directInput: value,
          },
        },
      },
      update: (cache, { data }) => {
        const updatedCategory =
          data?.updatePrimaryBudgetCategory?.primaryBudgetCategory;
        if (updatedCategory) {
          cache.writeFragment({
            id: cache.identify(category),
            fragment: gql`
              fragment UpdatePrimaryBudgetCategory on PrimaryBudgetCategory {
                id
                directInput
              }
            `,
            data: {
              id: category.id,
              directInput: value,
            },
          });
        }
      },
    });
  };

  const debouncedUpdateMutation = useDebouncedCallback(
    updatePrimaryBudgetCategoryMutation,
    500,
  );

  const handleDirectInputToggle = (enableDirectInput: boolean) => {
    const valueToSet = enableDirectInput ? lumpSumAmount || totalAmount : null;

    setCellErrors({});
    setDirectInputError('');
    updatePrimaryBudgetCategoryMutation(valueToSet);
  };

  const handleLumpSumChange = (value: string | number) => {
    const stringValue = value.toString();
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value;
    setInputValue(stringValue);
    const validationResult = validateDirectInput(numericValue);

    if (validationResult.hasErrors) {
      setDirectInputError(
        validationResult.errors['directInput-amount']?.[0] || '',
      );
    } else {
      setDirectInputError('');
      debouncedUpdateMutation(numericValue);
    }
  };

  const addExpense = () => {
    const tempId = `temp-${Date.now()}`;

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
      optimisticResponse: {
        createSubBudgetCategory: {
          __typename: 'SubBudgetCategoryCreateMutationPayload',
          subBudgetCategory: {
            __typename: 'SubBudgetCategory',
            id: tempId,
            label: t('New Income'),
            amount: 0,
          },
        },
      },
      update: (cache, { data }) => {
        const newItem = data?.createSubBudgetCategory?.subBudgetCategory;
        if (newItem) {
          cache.modify({
            id: cache.identify(category),
            fields: {
              subBudgetCategories(existingRefs = []) {
                const newSubCategoryRef = cache.writeFragment({
                  data: {
                    ...newItem,
                    category: null,
                  },
                  fragment: gql`
                    fragment NewSubBudgetCategory on SubBudgetCategory {
                      id
                      label
                      amount
                      category
                    }
                  `,
                });
                return [...existingRefs, newSubCategoryRef];
              },
            },
          });
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
      optimisticResponse: {
        deleteSubBudgetCategory: {
          __typename: 'SubBudgetCategoryDeleteMutationPayload',
          id: rowId,
        },
      },
      update: (cache, { data }) => {
        const deletedId = data?.deleteSubBudgetCategory?.id;
        if (deletedId) {
          cache.modify({
            id: cache.identify(category),
            fields: {
              subBudgetCategories(existingRefs = [], { readField }) {
                return existingRefs.filter(
                  (ref) => readField('id', ref) !== deletedId,
                );
              },
            },
          });
        }
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
      optimisticResponse: {
        updateSubBudgetCategory: {
          __typename: 'SubBudgetCategoryUpdateMutationPayload',
          subBudgetCategory: {
            __typename: 'SubBudgetCategory',
            id: newRow.id as string,
            label: newRow.label as string,
            amount: newRow.amount as number,
          },
        },
      },
      update: (cache, { data }) => {
        const updatedSubCategory =
          data?.updateSubBudgetCategory?.subBudgetCategory;
        if (updatedSubCategory) {
          cache.writeFragment({
            id: cache.identify(updatedSubCategory),
            fragment: gql`
              fragment UpdateSubBudgetCategory on SubBudgetCategory {
                id
                label
                amount
                category
              }
            `,
            data: updatedSubCategory,
          });
        }
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

        if (!params.row.canDelete) {
          return [
            <GridActionsCellItem
              key="forbidden"
              icon={<DoNotDisturbAltIcon />}
              label="forbidden"
              disabled
              showInMenu={false}
            />,
          ];
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
      {promptText && <Typography sx={{ mb: 2 }}>{t(promptText)}</Typography>}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="span" sx={{ mr: 3 }}>
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
              value={inputValue || lumpSumAmount}
              onChange={(e) => handleLumpSumChange(e.target.value)}
              error={!!directInputError}
              helperText={directInputError}
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
                isCellEditable={(params) => {
                  // Don't allow editing the total row or label field when canDelete is false
                  if (params.id === 'total') {
                    return false;
                  }
                  if (params.field === 'label' && !params.row.canDelete) {
                    return false;
                  }
                  return true;
                }}
              />
            </Box>
          </>
        )}
      </StyledCard>

      {Object.keys(cellErrors).length > 0 &&
        Object.entries(cellErrors).map(([cellKey, errors]) => (
          <FormHelperText key={cellKey} error={true} sx={{ mb: 0.5 }}>
            {errors[0]}
          </FormHelperText>
        ))}
    </>
  );
};
