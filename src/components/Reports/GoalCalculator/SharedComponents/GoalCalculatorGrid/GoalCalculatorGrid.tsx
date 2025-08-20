import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Card, Switch, Typography, styled } from '@mui/material';
import {
  GridActionsCellItem,
  GridApi,
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
  gap: 0,
  alignItems: 'center',
});

const StyledAddButton = styled(Button)({
  color: 'primary.main',
});

const StyledToggleBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

const StyledDirectInputText = styled(Typography)({
  color: 'primary.main',
  fontSize: '0.875rem',
  fontWeight: 500,
});

const StyledGridContainer = styled(Box)({
  height: 'auto',
  width: '100%',
});

export interface GoalCalculatorGridFormValues {
  gridData: Array<{
    id: number | string;
    name: string;
    amount: number;
  }>;
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
  };

  const validationSchema = yup.object({
    gridData: yup.array().of(
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
    ),
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

type GridDataItem = {
  id: number | string;
  name: string;
  amount: number;
};
interface GoalCalculatorGridFormProps {
  categoryName: string;
}

const GoalCalculatorGridForm: React.FC<GoalCalculatorGridFormProps> = ({
  categoryName,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { values, setFieldValue } =
    useFormikContext<GoalCalculatorGridFormValues>();
  const [directInput, setDirectInput] = useState(false);
  const [originalData, setOriginalData] = useState<GridDataItem[]>(
    values.gridData,
  );
  const gridRef = useRef<GridApi | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Create dataWithTotal that reacts to totalAmount changes
  const dataWithTotal = useMemo(() => {
    if (directInput) {
      return values.gridData;
    } else {
      const dataWithoutTotal = values.gridData.filter(
        (item) => item.id !== 'total',
      );
      return [
        ...dataWithoutTotal,
        { id: 'total', name: 'Total', amount: totalAmount },
      ];
    }
  }, [values.gridData, totalAmount, directInput]);

  // Calculate total from data excluding the total row (but only when NOT in direct input mode)
  useEffect(() => {
    if (!directInput) {
      const dataWithoutTotal = values.gridData.filter(
        (item) => item.id !== 'total',
      );
      const newTotal = dataWithoutTotal.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      setTotalAmount(newTotal);
    }
  }, [values.gridData, directInput]);

  // Update gridData when directInput changes
  useEffect(() => {
    let fieldValue: Array<GridDataItem> = [];
    if (directInput && gridRef.current) {
      setOriginalData([...values.gridData]);
      setTimeout(() => {
        if (gridRef.current) {
          gridRef.current.startCellEditMode({ id: 'total', field: 'amount' });
        }
      }, 100);
      fieldValue = [{ id: 'total', name: 'Total', amount: 0 }];
      setFieldValue('gridData', [{ id: 'total', name: 'Total', amount: 0 }]);
    } else if (gridRef.current && originalData.length > 0) {
      fieldValue = originalData;
    }
    setFieldValue('gridData', fieldValue);
  }, [directInput]);

  const handleDelete = (id: number | string) => {
    const updatedData = values.gridData.filter((item) => item.id !== id);
    setFieldValue('gridData', updatedData);
  };

  const addExpense = () => {
    const numericIds = values.gridData
      .map((item) => item.id)
      .filter((id) => id !== 'total' && typeof id === 'number');
    const newId = Math.max(...numericIds, 0) + 1;
    const newIncomeItem = {
      id: newId,
      name: t('New Income'),
      amount: 0,
    };
    const updatedData = [...values.gridData, newIncomeItem];
    setFieldValue('gridData', updatedData);
  };

  const handleDirectInputToggle = () => {
    setDirectInput(!directInput);
  };

  const processRowUpdate = useCallback(
    (newRow: GridValidRowModel) => {
      if (newRow.id === 'total') {
        setTotalAmount(newRow.amount as number);
        setFieldValue('gridData', [newRow]);
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
    },
    [setFieldValue, values.gridData],
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: categoryName,
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
    <StyledCard>
      <StyledControlsBox>
        <StyledAddButton
          variant="text"
          onClick={addExpense}
          size="small"
          startIcon={<AddIcon />}
          disabled={directInput}
        >
          {t('Add {{category}}', { category: categoryName })}
        </StyledAddButton>
        <StyledToggleBox>
          <Switch
            checked={directInput}
            onChange={handleDirectInputToggle}
            size="small"
          />

          <StyledDirectInputText variant="button">
            {t('Direct Input')}
          </StyledDirectInputText>
        </StyledToggleBox>
      </StyledControlsBox>

      <StyledGridContainer>
        <StyledGrid
          ref={gridRef}
          rows={dataWithTotal}
          columns={columns}
          processRowUpdate={processRowUpdate}
          directInput={directInput}
        />
      </StyledGridContainer>
    </StyledCard>
  );
};
