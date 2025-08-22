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
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { StyledGrid } from './StyledGrid';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(2),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledControlsBox = styled(Box)({
  padding: 1,
  display: 'flex',
  alignItems: 'center',
});

const StyledAddButton = styled(Button)({
  color: 'primary.main',
});

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: theme.spacing(1),
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  marginBottom: theme.spacing(1),
}));

const StyledModeButton = styled(Button)<{
  isActive?: boolean;
}>(({ theme, isActive }) => ({
  color: isActive ? theme.palette.grey[800] : theme.palette.grey[700],
  backgroundColor: isActive ? theme.palette.grey[300] : theme.palette.grey[200],
  '&.MuiButton-root': {
    border: `1px solid ${theme.palette.grey[400]} !important`,
  },
  '&:hover': {
    backgroundColor: isActive
      ? theme.palette.grey[400]
      : theme.palette.grey[300],
  },
}));

const StyledGridContainer = styled(Box)({
  height: 'auto',
  width: '100%',
});

export interface GoalCalculatorGridFormValues {
  gridData: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
  lumpSumAmount: number;
}

interface GoalCalculatorGridProps {
  formData?: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
  promptText?: string;
  categoryName: string;
}

export const GoalCalculatorGrid: React.FC<GoalCalculatorGridProps> = ({
  formData,
  promptText,
  categoryName,
}) => {
  const { handleContinue } = useGoalCalculator();
  const { t } = useTranslation();

  const initialValues: GoalCalculatorGridFormValues = {
    gridData: formData || [
      { id: 1, name: 'Freelance Work', amount: 2500 },
      { id: 2, name: 'Investment Returns', amount: 1200 },
      { id: 3, name: 'Rental Income', amount: 1800 },
    ],
    lumpSumAmount: 0,
  };

  const validationSchema = yup.object({
    gridData: yup
      .array()
      .of(
        yup.object({
          id: yup.number().required(),
          name: yup
            .string()
            .min(2, t('Name must be at least 2 characters'))
            .required(t('Name is required')),
          amount: yup
            .number()
            .min(0, t('Amount must be positive'))
            .required(t('Amount is required')),
        }),
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
      {promptText && <StyledTypography>{t(promptText)}</StyledTypography>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <GoalCalculatorGridForm categoryName={categoryName} />
        </Form>
      </Formik>
    </>
  );
};

interface GoalCalculatorGridFormProps {
  categoryName: string;
}

const GoalCalculatorGridForm: React.FC<GoalCalculatorGridFormProps> = ({
  categoryName,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<GoalCalculatorGridFormValues>();
  const locale = useLocale();

  const totalAmount = values.gridData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const dataWithTotal = [
    ...values.gridData,
    { id: 'total', name: 'Total', amount: totalAmount },
  ];

  const [directInput, setDirectInput] = useState(false);

  const addExpense = () => {
    const newId = Math.max(...values.gridData.map((item) => item.id), 0) + 1;
    const newIncomeItem = {
      id: newId,
      name: t('New Income'),
      amount: 0,
    };
    const updatedData = [...values.gridData, newIncomeItem];
    setFieldValue('gridData', updatedData);
  };

  const handleDelete = (id: number) => {
    const updatedData = values.gridData.filter((item) => item.id !== id);
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
            name: newRow.name as string,
            amount: newRow.amount as number,
          }
        : item,
    );
    setFieldValue('gridData', updatedData);
    return newRow;
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
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
            onClick={() => handleDelete(params.id as number)}
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
        <StyledButtonGroup>
          <StyledModeButton
            variant="outlined"
            size="small"
            isActive={directInput}
            onClick={() => setDirectInput(true)}
            startIcon={<FunctionsIcon />}
          >
            {t('Lump Sum')}
          </StyledModeButton>
          <StyledModeButton
            variant="outlined"
            size="small"
            isActive={!directInput}
            onClick={() => setDirectInput(false)}
            startIcon={<ViewHeadlineIcon />}
          >
            {t('Line Item')}
          </StyledModeButton>
        </StyledButtonGroup>
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
              onChange={(e) => setFieldValue('lumpSumAmount', e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        ) : (
          <>
            <StyledControlsBox>
              <StyledAddButton
                variant="text"
                onClick={addExpense}
                size="small"
                startIcon={<AddIcon />}
              >
                {t('Add Expense')}
              </StyledAddButton>
            </StyledControlsBox>

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
