import React, { useEffect, useMemo, useState } from 'react';
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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SubBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  getPrimaryCategoryRightPanel,
  getSubCategoryRightPanel,
} from '../../RightPanels/rightPanels';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../../Shared/GoalCalculatorSection';
import {
  UpdateSubBudgetCategoriesFragment,
  UpdateSubBudgetCategoriesFragmentDoc,
  useCreateSubBudgetCategoryMutation,
  useDeleteSubBudgetCategoryMutation,
  useUpdatePrimaryBudgetCategoryMutation,
  useUpdateSubBudgetCategoryMutation,
} from './GoalCalculatorGrid.generated';
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
  promptText,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { label: categoryName } = category;
  const accountListId = useAccountListId() ?? '';
  const { setRightPanelContent, trackMutation } = useGoalCalculator();

  const gridData = useMemo(
    () =>
      category.subBudgetCategories.map((subCategory) => ({
        id: subCategory.id,
        label: subCategory.label,
        amount: subCategory.amount,
        canDelete: !subCategory.category,
        category: subCategory.category,
      })),
    [category.subBudgetCategories],
  );

  const totalAmount = gridData.reduce((sum, item) => sum + item.amount, 0);
  const [cellErrors, setCellErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [directInputError, setDirectInputError] = useState<string>('');
  const [lumpSumValue, setLumpSumValue] = useState<string>('');
  const [updatePrimaryBudgetCategory] =
    useUpdatePrimaryBudgetCategoryMutation();
  const [updateSubBudgetCategory] = useUpdateSubBudgetCategoryMutation();
  const [createSubBudgetCategory] = useCreateSubBudgetCategoryMutation();
  const [deleteSubBudgetCategory] = useDeleteSubBudgetCategoryMutation();

  const dataWithTotal = useMemo(
    () => [...gridData, { id: 'total', label: 'Total', amount: totalAmount }],
    [gridData, totalAmount],
  );

  const directInput = category.directInput !== null;
  const lumpSumAmount = category.directInput || 0;

  useEffect(() => {
    if (directInput) {
      setLumpSumValue(lumpSumAmount.toString());
    }
  }, [lumpSumAmount, directInput]);

  const updateDirectInput = (directInput: number | null) => {
    trackMutation(
      updatePrimaryBudgetCategory({
        variables: {
          input: {
            accountListId,
            attributes: {
              id: category.id,
              directInput,
            },
          },
        },
        optimisticResponse: {
          updatePrimaryBudgetCategory: {
            __typename: 'PrimaryBudgetCategoryUpdateMutationPayload',
            primaryBudgetCategory: {
              __typename: 'PrimaryBudgetCategory',
              id: category.id,
              directInput,
              updatedAt: DateTime.now().toISO(),
            },
          },
        },
      }),
    );
  };

  const debouncedUpdateMutation = useDebouncedCallback(updateDirectInput, 500);

  const handleDirectInputToggle = (enableDirectInput: boolean) => {
    if (enableDirectInput) {
      // Switching to "Lump Sum" mode
      // Parse the current input value, or use null if empty/invalid
      const existingValue = lumpSumValue ? parseFloat(lumpSumValue) : null;

      // If no input value exists, populate with the current total from line items
      if (!lumpSumValue) {
        setLumpSumValue(totalAmount.toString());
      }

      // Set directInput to the existing value or fall back to totalAmount
      // This preserves user input or defaults to the calculated total
      updateDirectInput(existingValue || totalAmount);
    } else {
      // Switching to "Line Item" mode
      // Set directInput to null to indicate line item mode
      updateDirectInput(null);
    }

    // Clear any validation errors when switching modes
    setCellErrors({});
    setDirectInputError('');
  };

  const handleLumpSumChange = (value: string | number) => {
    const stringValue = value.toString();
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value;
    setLumpSumValue(stringValue);

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

    trackMutation(
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
              updatedAt: DateTime.now().toISO(),
            },
          },
        },
        update: (cache, { data }) => {
          const newItem = data?.createSubBudgetCategory?.subBudgetCategory;
          if (newItem) {
            cache.updateFragment<UpdateSubBudgetCategoriesFragment>(
              {
                id: `PrimaryBudgetCategory:${category.id}`,
                fragment: UpdateSubBudgetCategoriesFragmentDoc,
                fragmentName: 'UpdateSubBudgetCategories',
              },
              (data) => {
                return (
                  data && {
                    ...data,
                    subBudgetCategories: [...data.subBudgetCategories, newItem],
                  }
                );
              },
            );
          }
        },
      }),
    );
  };

  const handleDelete = (id: string | number) => {
    const rowId = id.toString();

    trackMutation(
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
          if (data?.deleteSubBudgetCategory?.id) {
            cache.updateFragment<UpdateSubBudgetCategoriesFragment>(
              {
                id: `PrimaryBudgetCategory:${category.id}`,
                fragment: UpdateSubBudgetCategoriesFragmentDoc,
                fragmentName: 'UpdateSubBudgetCategories',
              },
              (data) => {
                return (
                  data && {
                    ...data,
                    subBudgetCategories: data.subBudgetCategories.filter(
                      (cat) => cat.id !== rowId,
                    ),
                  }
                );
              },
            );
          }
        },
      }),
    );
  };

  const processRowUpdate = (newRow: GridValidRowModel) => {
    // Don't process the total row - it's read-only and calculated
    if (newRow.id === 'total') {
      return newRow;
    }

    // Extract the updated values from the grid row
    const rowId = newRow.id as string;
    const label = newRow.label as string;
    const amount = newRow.amount as number;

    try {
      // Validate the updated row data using yup schema
      subBudgetCategorySchema.validateSync({ label, amount });

      // Clear any existing validation errors for this row since validation passed
      setCellErrors((prev) => {
        const updated = { ...prev };
        delete updated[`${rowId}-label`];
        delete updated[`${rowId}-amount`];
        return updated;
      });

      trackMutation(
        updateSubBudgetCategory({
          variables: {
            input: {
              accountListId,
              attributes: {
                id: rowId,
                label,
                amount,
              },
            },
          },
          optimisticResponse: {
            updateSubBudgetCategory: {
              __typename: 'SubBudgetCategoryUpdateMutationPayload',
              subBudgetCategory: {
                __typename: 'SubBudgetCategory',
                id: rowId,
                label,
                amount,
                updatedAt: DateTime.now().toISO(),
              },
            },
          },
        }),
      );
    } catch (error) {
      // Handle validation errors from yup schema
      if (error instanceof yup.ValidationError) {
        // Set validation errors in state to display in the UI
        setCellErrors((prev) => ({
          ...prev,
          [`${rowId}-${error.path}`]: error.message,
        }));
      }
    }

    // Return the updated row data for the grid to display
    return newRow;
  };

  const renderLabelCell = (params: GridRenderCellParams) => {
    const rowCategory = params.row.category as SubBudgetCategoryEnum | null;
    const rightPanelContent = rowCategory
      ? getSubCategoryRightPanel(rowCategory)
      : null;

    const content = (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <span>{params.value}</span>
        {rightPanelContent && (
          <IconButton
            onClick={() => setRightPanelContent(rightPanelContent)}
            aria-label={t('Show additional info')}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );

    return content;
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
    <GoalCalculatorSection
      title={categoryName}
      titleExtra={
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
      }
      rightPanelContent={
        getPrimaryCategoryRightPanel(category.category) ?? undefined
      }
    >
      {promptText && <Typography sx={{ mb: 2 }}>{t(promptText)}</Typography>}

      <StyledCard>
        {directInput ? (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('Total')}
              type="number"
              value={lumpSumValue}
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

            <StyledGrid
              rows={dataWithTotal}
              columns={columns}
              processRowUpdate={processRowUpdate}
              onCellEditStart={(_, event) => {
                // This is event is triggered before the input exists, so wait briefly for it to be created
                requestAnimationFrame(() => {
                  const input =
                    event.target instanceof HTMLElement &&
                    event.target.querySelector('input');
                  if (!input) {
                    return;
                  }

                  // number inputs don't support selecting text, so temporarily switch to a text input
                  input.type = 'text';
                  input.setSelectionRange(0, input.value.length);
                  input.type = 'number';
                });
              }}
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
          </>
        )}
      </StyledCard>

      {Object.keys(cellErrors).length > 0 &&
        Object.entries(cellErrors).map(([cellKey, error]) => (
          <FormHelperText key={cellKey} error={true} sx={{ mb: 0.5 }}>
            {error}
          </FormHelperText>
        ))}
    </GoalCalculatorSection>
  );
};
