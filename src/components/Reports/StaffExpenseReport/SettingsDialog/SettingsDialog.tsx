import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { DateRange } from '../Helpers/StaffReportEnum';

interface SettingsDialogProps {
  isOpen: boolean;
  selectedFilters?: Filters;
  onClose: (filters?: Filters) => void;
}

export interface Filters {
  selectedDateRange: DateRange | undefined;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  // change to enum array when category data is provided
  categories?: string[] | null;
}

const validationSchema = Yup.object({
  selectedDateRange: Yup.mixed().nullable(),
  startDate: Yup.mixed().nullable(),
  endDate: Yup.mixed().nullable(),
  categories: Yup.array().of(Yup.string()),
});

const calculateDateRange = (
  range: DateRange,
): { startDate: DateTime; endDate: DateTime } => {
  const now = DateTime.now();

  switch (range) {
    case DateRange.WeekToDate:
      return {
        startDate: now.startOf('week'),
        endDate: now.endOf('day'),
      };
    case DateRange.MonthToDate:
      return {
        startDate: now.startOf('month'),
        endDate: now.endOf('day'),
      };
    case DateRange.YearToDate:
      return {
        startDate: now.startOf('year'),
        endDate: now.endOf('day'),
      };
    default:
      throw new Error(`Unsupported date range: ${range}`);
  }
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [hasDateRangeError, setHasDateRangeError] = useState(false);

  const initialValues = {
    selectedDateRange: selectedFilters?.selectedDateRange ?? undefined,
    startDate:
      selectedFilters?.selectedDateRange !== undefined
        ? null
        : selectedFilters?.startDate ?? null,
    endDate:
      selectedFilters?.selectedDateRange !== undefined
        ? null
        : selectedFilters?.endDate ?? null,
    categories: selectedFilters?.categories ?? [],
  };

  /*
   * Initially, date range validation was handled by Yup,
   * but it would not properly disable the submit button.
   * This manual validation function is a temporary solution.
   */
  const validateDateRange = (
    startDate: DateTime | null,
    endDate: DateTime | null,
  ) => {
    if (startDate && endDate && startDate > endDate) {
      enqueueSnackbar(t('Start date must be earlier than end date'), {
        variant: 'error',
      });
      setHasDateRangeError(true);
      return false;
    }
    setHasDateRangeError(false);
    return true;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose(selectedFilters)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{t('Report Settings')}</DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          if (
            values.startDate &&
            values.endDate &&
            !validateDateRange(values.startDate, values.endDate)
          ) {
            // Don't submit if validation fails
            return;
          }

          const finalValues = { ...values };
          if (values.selectedDateRange !== undefined) {
            const { startDate, endDate } = calculateDateRange(
              values.selectedDateRange,
            );
            finalValues.startDate = startDate;
            finalValues.endDate = endDate;
          }
          onClose(finalValues);
        }}
      >
        {({ values, setFieldValue, isValid, dirty, resetForm }) => {
          const isDateRangeValid =
            !values.startDate || !values.endDate
              ? true
              : values.endDate >= values.startDate;

          const isFormValid = isValid && isDateRangeValid && !hasDateRangeError;

          return (
            <Form>
              <DialogContent>
                <TextField
                  select
                  label={t('Select Date Range')}
                  fullWidth
                  value={values.selectedDateRange ?? ''}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? undefined : e.target.value;
                    setFieldValue('selectedDateRange', value);
                    // Clear custom dates when predefined range is selected
                    if (value !== undefined) {
                      setFieldValue('startDate', null);
                      setFieldValue('endDate', null);
                      setHasDateRangeError(false);
                    }
                  }}
                >
                  <MenuItem value="">{t('None')}</MenuItem>
                  <MenuItem value={DateRange.WeekToDate}>
                    {t('Week to Date')}
                  </MenuItem>
                  <MenuItem value={DateRange.MonthToDate}>
                    {t('Month to Date')}
                  </MenuItem>
                  <MenuItem value={DateRange.YearToDate}>
                    {t('Year to Date')}
                  </MenuItem>
                </TextField>

                <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                  {t('Or enter a custom date range:')}
                </Typography>

                <Box display="flex" gap={2}>
                  <CustomDateField
                    label={t('Start Date')}
                    value={values.startDate}
                    onChange={(date) => {
                      setFieldValue('startDate', date);
                      if (date && values.endDate) {
                        validateDateRange(date, values.endDate);
                      } else {
                        setHasDateRangeError(false);
                      }

                      // Clear predefined range when custom date is set
                      if (date) {
                        setFieldValue('selectedDateRange', undefined);
                      }
                    }}
                    fullWidth
                  />
                  <CustomDateField
                    label={t('End Date')}
                    value={values.endDate}
                    onChange={(date) => {
                      setFieldValue('endDate', date);
                      if (date && values.startDate) {
                        validateDateRange(values.startDate, date);
                      } else {
                        setHasDateRangeError(false);
                      }

                      // Clear predefined range when custom date is set
                      if (date) {
                        setFieldValue('selectedDateRange', undefined);
                      }
                    }}
                    fullWidth
                  />
                </Box>

                <Typography sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {t(
                    `You can combine certain categories of data into single rows. This may be useful for long date ranges (e.g., "Year to Date").
                    Select which categories to consolidate. Each category remains separate.`,
                  )}
                </Typography>

                <Typography sx={{ mt: 2, mb: 1 }}>
                  {t('Select Categories:')}
                </Typography>

                <FormGroup row>
                  {['Benefits', 'Contributions', 'Salary'].map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={values.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...values.categories, category]
                              : values.categories.filter((c) => c !== category);
                            setFieldValue('categories', newCategories);
                          }}
                        />
                      }
                      label={t(category)}
                    />
                  ))}
                </FormGroup>
              </DialogContent>

              <DialogActions>
                <Button
                  onClick={() => {
                    resetForm();
                    setHasDateRangeError(false);
                    onClose(selectedFilters);
                  }}
                  color="secondary"
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={!dirty || !isFormValid}
                >
                  {t('Apply Filters')}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};
