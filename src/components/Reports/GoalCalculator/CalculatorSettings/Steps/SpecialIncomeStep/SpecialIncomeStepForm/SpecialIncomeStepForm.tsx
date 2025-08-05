import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Card, Switch, Typography, styled } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorGrid } from '../../../../SharedComponents/GoalCalculatorGrid';
import { SpecialIncomeFormValues } from '../SpecialIncomeStep';

const StyledCard = styled(Card)({
  borderRadius: '4px',
});

interface SpecialIncomeStepFormProps {
  formikProps: FormikProps<SpecialIncomeFormValues>;
}

export const SpecialIncomeStepForm: React.FC<SpecialIncomeStepFormProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = formikProps;

  // Calculate total dynamically from the actual form data
  const totalAmount = values.specialIncomeData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Add total row to the data
  const dataWithTotal = [
    ...values.specialIncomeData,
    { id: 'total', name: 'Total', amount: totalAmount },
  ];

  // State for Direct Input toggle
  const [directInput, setDirectInput] = useState(false);

  // Handler for adding special income
  const addSpecialIncome = () => {
    const newId =
      Math.max(...values.specialIncomeData.map((item) => item.id), 0) + 1;
    const newIncomeItem = {
      id: newId,
      name: 'New Income',
      amount: 0,
    };
    const updatedData = [...values.specialIncomeData, newIncomeItem];
    setFieldValue('specialIncomeData', updatedData);
  };

  // Handler for toggling direct input
  const handleDirectInputToggle = () => {
    setDirectInput(!directInput);
  };

  // Handler for deleting a row
  const handleDelete = (id: number) => {
    const updatedData = values.specialIncomeData.filter(
      (item) => item.id !== id,
    );
    setFieldValue('specialIncomeData', updatedData);
  };

  // Handle row updates
  const processRowUpdate = (newRow: GridValidRowModel) => {
    // Don't allow editing the total row
    if (newRow.id === 'total') {
      return newRow;
    }

    const updatedData = values.specialIncomeData.map((item) =>
      item.id === newRow.id
        ? {
            ...item,
            name: newRow.name as string,
            amount: newRow.amount as number,
          }
        : item,
    );
    setFieldValue('specialIncomeData', updatedData);
    return newRow;
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('Special Income Name'),
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
      renderCell: (params) => `$${params.value.toLocaleString()}`,
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
    <Box>
      <StyledCard>
        <Box sx={{ p: 1, display: 'flex', gap: 0, alignItems: 'center' }}>
          <Button
            variant="text"
            onClick={addSpecialIncome}
            size="small"
            sx={{ color: 'primary.main' }}
            startIcon={<AddIcon />}
          >
            {t('Add Special Income')}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={directInput}
              onChange={handleDirectInputToggle}
              size="small"
            />

            <Typography
              sx={{
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              variant="button"
            >
              {t('Direct Input')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 'auto', width: '100%' }}>
          <GoalCalculatorGrid
            rows={dataWithTotal}
            columns={columns}
            processRowUpdate={processRowUpdate}
          />
        </Box>
      </StyledCard>
    </Box>
  );
};
