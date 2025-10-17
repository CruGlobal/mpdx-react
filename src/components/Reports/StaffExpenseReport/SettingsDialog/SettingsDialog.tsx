import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Loading from 'src/components/Loading/Loading';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { Fund, StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { useReportsStaffExpensesQuery } from '../GetStaffExpense.generated';
import { DateRange } from '../Helpers/StaffReportEnum';
import { getAvailableCategories } from '../Helpers/filterTransactions';
import { getLocalizedCategory } from '../Helpers/useLocalizedCategory';

export interface SettingsDialogProps {
  isOpen: boolean;
  selectedFilters?: Filters;
  onClose: (filters?: Filters) => void;
}

export interface Filters {
  selectedDateRange: DateRange | null;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  categories?: string[];
}

const validationSchema = yup.object({
  selectedDateRange: yup.mixed().nullable(),
  startDate: yup
    .mixed()
    .nullable()
    .test(
      'start-date-validation',
      i18n.t('Start date must be earlier than or equal to end date'),
      function (value) {
        const { endDate } = this.parent;
        if (!value || !endDate) {
          return true;
        }

        return value <= endDate;
      },
    ),
  endDate: yup
    .mixed()
    .nullable()
    .test(
      'end-date-validation',
      i18n.t('End date must be later than or equal to start date'),
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) {
          return true;
        }

        return startDate <= value;
      },
    ),
  categories: yup.array().of(yup.string()),
});

const calculateDateRange = (
  range: DateRange,
): { startDate: DateTime; endDate: DateTime } => {
  const now = DateTime.now();
  const endDate = now.endOf('day');
  switch (range) {
    case DateRange.WeekToDate:
      return {
        startDate: now.startOf('week'),
        endDate,
      };
    case DateRange.MonthToDate:
      return {
        startDate: now.startOf('month'),
        endDate,
      };
    case DateRange.YearToDate:
      return {
        startDate: now.startOf('year'),
        endDate,
      };
    default:
      return {
        startDate: now.startOf('day'),
        endDate,
      };
  }
};

const getFiltersWithCalculatedDates = (values: Filters): Filters => {
  const finalValues = { ...values };
  if (values.selectedDateRange !== null) {
    const { startDate, endDate } = calculateDateRange(values.selectedDateRange);
    finalValues.startDate = startDate;
    finalValues.endDate = endDate;
  }
  return finalValues;
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
}) => {
  const { t } = useTranslation();
  const [previewFilters, setPreviewFilters] = useState<Filters | null>(null);

  const currentTime = useMemo(() => DateTime.now().startOf('month'), []);

  const handleClose = () => {
    setPreviewFilters(null);
    onClose(selectedFilters);
  };

  const getQueryVariables = (filterParams: Filters | null) => ({
    startMonth:
      filterParams?.startDate?.startOf('month').toISODate() ??
      filterParams?.endDate?.startOf('month').toISODate() ??
      currentTime.startOf('month').toISODate(),
    endMonth:
      filterParams?.endDate?.endOf('month').toISODate() ??
      currentTime.endOf('month').toISODate(),
  });

  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useReportsStaffExpensesQuery({
    variables: getQueryVariables(previewFilters ?? selectedFilters ?? null),
  });

  const availableCategories = useMemo(() => {
    const categoryFunds: Fund[] =
      categoryData?.reportsStaffExpenses?.funds ?? [];

    const filtersToUse = previewFilters ?? selectedFilters ?? null;

    return getAvailableCategories(categoryFunds, filtersToUse, currentTime);
  }, [categoryData, previewFilters, selectedFilters, currentTime]);

  const validateAndRefetch = (
    validateForm: () => Promise<Record<string, unknown>>,
    filters: Filters,
  ) => {
    setTimeout(() => {
      validateForm().then((errors) => {
        if (Object.keys(errors).length === 0) {
          setPreviewFilters(getFiltersWithCalculatedDates(filters));
        }
      });
    }, 0);
  };

  const initialValues = {
    selectedDateRange: selectedFilters?.selectedDateRange ?? null,
    startDate:
      selectedFilters?.selectedDateRange === null
        ? selectedFilters?.startDate
        : null,
    endDate:
      selectedFilters?.selectedDateRange === null
        ? selectedFilters?.endDate
        : null,
    categories: selectedFilters?.categories ?? [],
  };

  const handleSubmit = (values: Filters) => {
    setPreviewFilters(null); // Clear preview filters when dialog closes
    onClose(getFiltersWithCalculatedDates(values));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{t('Report Settings')}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnChange
        validateOnBlur
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({
          values,
          setFieldValue,
          isValid,
          dirty,
          errors,
          touched,
          validateForm,
          setTouched,
        }) => {
          return (
            <Form>
              <DialogContent>
                <TextField
                  select
                  label={t('Select Date Range')}
                  fullWidth
                  value={values.selectedDateRange ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value;
                    setFieldValue('selectedDateRange', value);
                    if (value !== null) {
                      setFieldValue('startDate', null);
                      setFieldValue('endDate', null);

                      setTouched({
                        ...touched,
                        startDate: false,
                        endDate: false,
                      });
                    }
                    validateAndRefetch(validateForm, {
                      ...values,
                      selectedDateRange: value as DateRange | null,
                      ...(value !== null && { startDate: null, endDate: null }),
                    });
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
                    value={values.startDate ?? null}
                    onChange={(date) => {
                      setFieldValue('startDate', date);
                      setTouched({ ...touched, startDate: true });
                      if (date) {
                        setFieldValue('selectedDateRange', null);
                      }
                      validateAndRefetch(validateForm, {
                        ...values,
                        startDate: date,
                        selectedDateRange: date
                          ? null
                          : values.selectedDateRange,
                      });
                    }}
                    fullWidth
                    error={Boolean(errors.startDate && touched.startDate)}
                    helperText={
                      errors.startDate && touched.startDate
                        ? errors.startDate
                        : ''
                    }
                  />
                  <CustomDateField
                    label={t('End Date')}
                    value={values.endDate ?? null}
                    onChange={(date) => {
                      setFieldValue('endDate', date);
                      setTouched({ ...touched, endDate: true });
                      if (date) {
                        setFieldValue('selectedDateRange', null);
                      }
                      validateAndRefetch(validateForm, {
                        ...values,
                        endDate: date,
                        selectedDateRange: date
                          ? null
                          : values.selectedDateRange,
                      });
                    }}
                    fullWidth
                    error={Boolean(errors.endDate && touched.endDate)}
                    helperText={
                      errors.endDate && touched.endDate ? errors.endDate : ''
                    }
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

                {categoryLoading ? (
                  <Loading loading />
                ) : categoryError ? (
                  <Alert severity="error">
                    {t('Failed to load categories. Please try again.')}
                  </Alert>
                ) : !availableCategories.length ? (
                  <Alert severity="info">
                    {t(
                      'No transactions with categories found in the selected date range.',
                    )}
                  </Alert>
                ) : (
                  <FormGroup row>
                    {availableCategories.map((category) => {
                      const localizedCategory = getLocalizedCategory(
                        category as StaffExpenseCategoryEnum,
                        t,
                      );
                      return (
                        <FormControlLabel
                          key={category}
                          control={
                            <Checkbox
                              checked={values.categories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...values.categories, category]
                                  : values.categories.filter(
                                      (c) => c !== category,
                                    );
                                setFieldValue('categories', newCategories);
                              }}
                            />
                          }
                          label={localizedCategory}
                        />
                      );
                    })}
                  </FormGroup>
                )}
              </DialogContent>

              <DialogActions>
                <Button sx={{ color: 'black' }} onClick={handleClose}>
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={!dirty || !isValid}
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
