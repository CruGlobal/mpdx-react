import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CurrencyAdornment } from '../../../../Shared/Adornments';

interface MileageStepFormValues {
  // Mileage entries
  additionalMileage: Array<{
    label: string;
    amount: number;
  }>;
}

export const MileageStepForm: React.FC = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<MileageStepFormValues>();

  const addMileageField = () => {
    const newMileage = { label: '', amount: 0 };
    const updatedMileage = [...values.additionalMileage, newMileage];
    setFieldValue('additionalMileage', updatedMileage);
  };

  const removeMileageField = (index: number) => {
    const updatedMileage = values.additionalMileage.filter(
      (_, i) => i !== index,
    );
    setFieldValue('additionalMileage', updatedMileage);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Dynamic Additional Mileage Fields */}
        {values.additionalMileage.map((mileage, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Mileage Label')}
                value={mileage.label}
                onChange={(e) =>
                  setFieldValue(
                    `additionalMileage.${index}.label`,
                    e.target.value,
                  )
                }
                variant="outlined"
                placeholder={t('e.g., Home visits, Conference travel')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Mileage')}
                type="number"
                value={mileage.amount}
                onChange={(e) =>
                  setFieldValue(
                    `additionalMileage.${index}.amount`,
                    parseFloat(e.target.value) || 0,
                  )
                }
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <IconButton
                      onClick={() => removeMileageField(index)}
                      size="small"
                      aria-label={t('Delete mileage')}
                      sx={{ color: 'black', p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </React.Fragment>
        ))}

        {/* Add Mileage Button */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={addMileageField}
            size="small"
            fullWidth
            sx={{
              mt: 1,
              borderStyle: 'dashed',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderStyle: 'dashed',
                borderColor: 'primary.dark',
                backgroundColor: 'primary.light',
                opacity: 0.1,
              },
            }}
          >
            {t('+ Add Mileage')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
