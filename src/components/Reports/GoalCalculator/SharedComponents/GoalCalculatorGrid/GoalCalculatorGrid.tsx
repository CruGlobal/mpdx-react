import React, { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import FunctionsIcon from '@mui/icons-material/Functions';
import InfoIcon from '@mui/icons-material/Info';
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
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import {
  NewSubBudgetCategoryFragmentDoc,
  useCreateSubBudgetCategoryMutation,
  useDeleteSubBudgetCategoryMutation,
  useUpdatePrimaryBudgetCategoryMutation,
  useUpdateSubBudgetCategoryMutation,
} from './GoalCalculatorGrid.graphql.generated';
import { StyledGrid } from './StyledGrid';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const ErrorCell = styled(Box)(({ theme }) => ({
  height: '100%',
  border: `2px solid ${theme.palette.error.main}`,
}));

interface GoalCalculatorGridProps {
  category: BudgetFamilyFragment['primaryBudgetCategories'][number];
  rightPanelContent?: JSX.Element;
  promptText?: string;
}

// Yup validation schemas
const directInputSchema = yup.object({
  amount: yup
    .number()
    .min(0, 'Amount must be positive')
    .required('Amount is required'),
});

const subBudgetCategorySchema = yup.object({
  label: yup
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(100, 'Label must be less than 100 characters')
    .required('Label is required'),
  amount: yup
    .number()
    .min(0, 'Amount must be positive')
    .required('Amount is required'),
});

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

  const gridData = React.useMemo(
    () =>
      (category.subBudgetCategories || []).map((subCategory) => ({
        id: subCategory.id,
        label: subCategory.label,
        amount: subCategory.amount,
        canDelete: !subCategory.category,
      })),
    [category.subBudgetCategories]
  );

  const totalAmount = gridData.reduce((sum, item) => sum + item.amount, 0);
  const [cellErrors, setCellErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [directInputError, setDirectInputError] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [updatePrimaryBudgetCategory] =
    useUpdatePrimaryBudgetCategoryMutation();
  const [localDirectInput, setLocalDirectInput] = useState<boolean | null>(
    null
  );
  const [updateSubBudgetCategory] = useUpdateSubBudgetCategoryMutation();
  const [createSubBudgetCategory] = useCreateSubBudgetCategoryMutation();
  const [deleteSubBudgetCategory] = useDeleteSubBudgetCategoryMutation();

  const dataWithTotal = [
    ...gridData,
    { id: 'total', label: 'Total', amount: totalAmount },
  ];

  const directInput =
    localDirectInput !== null ? localDirectInput : !!category.directInput;
  const lumpSumAmount = category.directInput || 0;

  useEffect(() => {
    if (directInput) {
      setInputValue(lumpSumAmount.toString());
    }
  }, [lumpSumAmount]);

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
          cache.updateFragment(
            {
              id: `PrimaryBudgetCategory:${category.id}`,
              fragment: gql`
                fragment UpdatePrimaryBudgetCategory on PrimaryBudgetCategory {
                  id
                  directInput
                }
              `,
            },
            (data) => ({
              ...data,
              directInput: value,
            })
          );
        }
      },
    });
  };

  const debouncedUpdateMutation = useDebouncedCallback(
    updatePrimaryBudgetCategoryMutation,
    500
  );

  const handleDirectInputToggle = (enableDirectInput: boolean) => {
    let valueToSet: number | null = null;

    if (enableDirectInput) {
      const existingValue = inputValue ? parseFloat(inputValue) : null;
      valueToSet = existingValue || totalAmount;

      if (!inputValue) {
        setInputValue(totalAmount.toString());
      }
    }

    setLocalDirectInput(enableDirectInput);
    setCellErrors({});
    setDirectInputError('');
    updatePrimaryBudgetCategoryMutation(valueToSet);
  };

  const handleLumpSumChange = (value: string | number) => {
    const stringValue = value.toString();
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value;
    setInputValue(stringValue);

    try {
      directInputSchema.validateSync({ amount: numericValue });
      setDirectInputError('');
      debouncedUpdateMutation(numericValue);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setDirectInputError(error.message);
      }
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
            category: null,
          },
        },
      },
      update: (cache, { data }) => {
        const newItem = data?.createSubBudgetCategory?.subBudgetCategory;
        if (newItem) {
          cache.updateFragment(
            {
              id: `PrimaryBudgetCategory:${category.id}`,
              fragment: gql`
                fragment UpdateSubBudgetCategories on PrimaryBudgetCategory {
                  id
                  subBudgetCategories {
                    ...NewSubBudgetCategory
                  }
                }
                ${NewSubBudgetCategoryFragmentDoc}
              `,
              fragmentName: 'UpdateSubBudgetCategories',
            },
            (data) => ({
              ...data,
              subBudgetCategories: [
                ...(data?.subBudgetCategories || []),
                {
                  ...newItem,
                  category: null,
                },
              ],
            })
          );
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
          cache.updateFragment(
            {
              id: `PrimaryBudgetCategory:${category.id}`,
              fragment: gql`
                fragment UpdateSubBudgetCategories on PrimaryBudgetCategory {
                  id
                  subBudgetCategories {
                    ...NewSubBudgetCategory
                  }
                }
                ${NewSubBudgetCategoryFragmentDoc}
              `,
              fragmentName: 'UpdateSubBudgetCategories',
            },
            (data) => ({
              ...data,
              subBudgetCategories: data.subBudgetCategories.filter(
                (item) => item.id !== deletedId
              ),
            })
          );
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

    try {
      subBudgetCategorySchema.validateSync({ label, amount });

      // Clear any existing errors for this row
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
              id: `SubBudgetCategory:${updatedSubCategory.id}`,
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
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Set validation errors
        setCellErrors((prev) => ({
          ...prev,
          [`${rowId}-${error.path}`]: error.message,
        }));
      }
    }

    return newRow;
  };

  const renderLabelCell = (params: GridRenderCellParams) => {
    const cellKey = `${params.id}-label`;
    const hasError = cellErrors[cellKey];

    if (hasError) {
      return <ErrorCell title={hasError}>{params.value}</ErrorCell>;
    }

    return params.value;
  };

  const renderAmountCell = (params: GridRenderCellParams) => {
    const cellKey = `${params.id}-amount`;
    const hasError = cellErrors[cellKey];
    const formattedValue = currencyFormat(params.value, 'USD', locale);

    if (hasError) {
      return <ErrorCell title={hasError}>{formattedValue}</ErrorCell>;
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

          <ButtonGroup>
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
        {rightPanelContent && (
          <IconButton
            className="print-hidden"
            onClick={() => {
              rightPanelContent && setRightPanelContent(rightPanelContent);
            }}
            aria-label={t('Show additional info')}
          >
            <InfoIcon />
          </IconButton>
        )}
      </Box>
      <StyledCard>
        {directInput ? (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('Total')}
              type="number"
              value={inputValue}
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
        Object.entries(cellErrors).map(([cellKey, error]) => (
          <FormHelperText key={cellKey} error={true} sx={{ mb: 0.5 }}>
            {error}
          </FormHelperText>
        ))}
    </>
  );
};
