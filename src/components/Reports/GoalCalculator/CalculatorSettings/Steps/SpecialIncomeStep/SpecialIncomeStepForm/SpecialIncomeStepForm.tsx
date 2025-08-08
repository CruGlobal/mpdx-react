import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  styled,
} from '@mui/material';
import { Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CurrencyAdornment } from '../../../../Shared/Adornments';

const StyledDeleteIconButton = styled(IconButton)(({ theme }) => ({
  color: 'black',
  padding: theme.spacing(0.5),
}));

const StyledAddIncomeButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderStyle: 'dashed',
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    borderStyle: 'dashed',
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
    opacity: 0.3,
  },
}));

interface SpecialIncomeFormValues {
  // Special income fields
  incidentIncome: number;
  propertyIncome: number;
  additionalIncomes: Array<{
    label: string;
    amount: number;
  }>;
}

interface SpecialIncomeStepFormProps {
  formikProps: FormikProps<SpecialIncomeFormValues>;
}

export const SpecialIncomeStepForm: React.FC<SpecialIncomeStepFormProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formikProps;

  const addIncomeField = () => {
    const newIncome = { label: '', amount: 0 };
    const updatedIncomes = [...values.additionalIncomes, newIncome];
    setFieldValue('additionalIncomes', updatedIncomes);
  };

  const removeIncomeField = (index: number) => {
    const updatedIncomes = values.additionalIncomes.filter(
      (_, i) => i !== index,
    );
    setFieldValue('additionalIncomes', updatedIncomes);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Field name="incidentIncome">
            {() => (
              <TextField
                fullWidth
                size="small"
                label={t('Incident Income')}
                name="incidentIncome"
                type="number"
                value={values.incidentIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.incidentIncome && Boolean(errors.incidentIncome)}
                helperText={touched.incidentIncome && errors.incidentIncome}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="propertyIncome">
            {() => (
              <TextField
                fullWidth
                size="small"
                label={t('Property Income')}
                name="propertyIncome"
                type="number"
                value={values.propertyIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.propertyIncome && Boolean(errors.propertyIncome)}
                helperText={touched.propertyIncome && errors.propertyIncome}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                }}
              />
            )}
          </Field>
        </Grid>

        {/* Dynamic Additional Income Fields */}
        {values.additionalIncomes.map((income, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Income Label')}
                value={income.label}
                onChange={(e) =>
                  setFieldValue(
                    `additionalIncomes.${index}.label`,
                    e.target.value,
                  )
                }
                variant="outlined"
                placeholder={t('e.g., Freelance, Side Business')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Amount')}
                type="number"
                value={income.amount}
                onChange={(e) =>
                  setFieldValue(
                    `additionalIncomes.${index}.amount`,
                    parseFloat(e.target.value) || 0,
                  )
                }
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <StyledDeleteIconButton
                      onClick={() => removeIncomeField(index)}
                      size="small"
                      aria-label={t('Delete income')}
                    >
                      <DeleteIcon fontSize="small" />
                    </StyledDeleteIconButton>
                  ),
                }}
              />
            </Grid>
          </React.Fragment>
        ))}

        {/* Add Income Button */}
        <Grid item xs={12}>
          <StyledAddIncomeButton
            variant="outlined"
            onClick={addIncomeField}
            size="small"
            fullWidth
          >
            {t('+ Add Income')}
          </StyledAddIncomeButton>
        </Grid>
      </Grid>
    </Box>
  );
};
