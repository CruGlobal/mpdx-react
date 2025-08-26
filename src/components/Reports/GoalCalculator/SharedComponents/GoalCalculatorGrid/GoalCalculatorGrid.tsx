import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FunctionsIcon from '@mui/icons-material/Functions';
import InfoIcon from '@mui/icons-material/Info';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  IconButton,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PrimaryBudgetCategory } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { useUpdatePrimaryBudgetCategoryMutation } from './PrimaryBudgetCategory.generated';
import { StyledGrid } from './StyledGrid';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const StyledAddButton = styled(Button)({
  color: 'primary.main',
});

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const StyledGridContainer = styled(Box)({
  height: 'auto',
  width: '100%',
});

export interface GoalCalculatorGridFormValues {
  gridData: Array<{
    id: string;
    label: string;
    amount: number;
  }>;
  lumpSumAmount: number;
}

interface GoalCalculatorGridProps {
  category: PrimaryBudgetCategory;
  promptText?: string;
  rightPanelContent?: JSX.Element;
}

export const GoalCalculatorGrid: React.FC<GoalCalculatorGridProps> = ({
  category,
  promptText,
  rightPanelContent,
}) => {
  const { handleContinue } = useGoalCalculator();
  const { t } = useTranslation();

  const initialValues: GoalCalculatorGridFormValues = {
    gridData: (category.subBudgetCategories || []).map((subCategory) => ({
      id: subCategory.id,
      label: subCategory.label,
      amount: subCategory.amount,
    })),
    lumpSumAmount: category.directInput || 0,
  };

  const validationSchema = yup.object({
    gridData: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          label: yup
            .string()
            .min(2, t('Name must be at least 2 characters'))
            .required(t('Name is required')),
          amount: yup
            .number()
            .min(0, t('Amount must be positive'))
            .required(t('Amount is required')),
        })
      )
      .optional(),
    lumpSumAmount: yup.number().min(0, t('Amount must be positive')).optional(),
  });

  const handleSubmit = () => {
    // Handle form submission here
    // TODO: Implement form submission logic
    handleContinue();
  };

  return (
    <>
      {promptText && <StyledSectionTitle>{t(promptText)}</StyledSectionTitle>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <GoalCalculatorGridForm
            category={category}
            rightPanelContent={rightPanelContent}
          />
        </Form>
      </Formik>
    </>
  );
};

interface GoalCalculatorGridFormProps {
  rightPanelContent?: JSX.Element;
  category: PrimaryBudgetCategory;
}

const GoalCalculatorGridForm: React.FC<GoalCalculatorGridFormProps> = ({
  rightPanelContent,
  category,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<GoalCalculatorGridFormValues>();
  const locale = useLocale();
  const { setRightPanelContent } = useGoalCalculator();
  const { label: categoryName, directInput: categoryDirectInput } = category;
  const accountListId = useAccountListId() ?? '';
  const [updatePrimaryBudgetCategory] =
    useUpdatePrimaryBudgetCategoryMutation();

  const totalAmount = values.gridData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const dataWithTotal = [
    ...values.gridData,
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
    const valueToSet = enableDirectInput
      ? values.lumpSumAmount || totalAmount
      : null;
    setDirectInput(enableDirectInput);
    debouncedUpdateMutation(valueToSet);
  };

  const handleLumpSumChange = (value: string | number) => {
    const numericValue =
      typeof value === 'string' ? parseFloat(value) || 0 : value;
    setFieldValue('lumpSumAmount', numericValue);
    debouncedUpdateMutation(numericValue);
  };

  const addExpense = () => {
    const numericIds = values.gridData
      .map((item) => parseInt(item.id.toString(), 10))
      .filter((id) => !isNaN(id));
    const newId = Math.max(...numericIds, 0) + 1;
    const newIncomeItem = {
      id: newId.toString(),
      label: t('New Income'),
      amount: 0,
    };
    const updatedData = [...values.gridData, newIncomeItem];
    setFieldValue('gridData', updatedData);
  };

  const handleDelete = (id: string | number) => {
    const updatedData = values.gridData.filter(
      (item) => item.id !== id.toString()
    );
    setFieldValue('gridData', updatedData);
  };

  const processRowUpdate = (newRow: GridValidRowModel) => {
    if (newRow.id === 'total') {
      return newRow;
    }

    const updatedData = values.gridData.map((item) =>
      item.id === newRow.id
        ? {
            ...item,
            label: newRow.label as string,
            amount: newRow.amount as number,
          }
        : item
    );
    setFieldValue('gridData', updatedData);
    return newRow;
  };

  const columns: GridColDef[] = [
    {
      field: 'label',
      headerName: t('Expense Name'),
      flex: 1,
      minWidth: 200,
      editable: true,
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
      renderCell: (params) => currencyFormat(params.value, 'USD', locale),
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
      <StyledBox>
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
        <Typography variant="h6">
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
        </Typography>
      </StyledBox>
      <StyledCard>
        {directInput ? (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('Total')}
              type="number"
              value={values.lumpSumAmount}
              onChange={(e) => handleLumpSumChange(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        ) : (
          <>
            <StyledAddButton
              variant="text"
              onClick={addExpense}
              size="small"
              startIcon={<AddIcon />}
            >
              {t('Add Line Item')}
            </StyledAddButton>

            <StyledGridContainer>
              <StyledGrid
                rows={dataWithTotal}
                columns={columns}
                processRowUpdate={processRowUpdate}
              />
            </StyledGridContainer>
          </>
        )}
      </StyledCard>
    </>
  );
};
