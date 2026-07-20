import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
import { CustomDateField } from 'src/components/Shared/DateTimePickers/CustomDateField';
import { Fund, StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { useReportsStaffExpensesQuery } from '../../StaffExpenseReport/GetStaffExpense.generated';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import { getAvailableCategories } from '../../StaffExpenseReport/Helpers/filterTransactions';
import { getStaffExpenseMonthRange } from '../../StaffExpenseReport/Helpers/getMonthRange';
import { getLocalizedCategory } from '../Helpers/transformStaffExpenseEnums';

export interface SettingsDialogProps {
  isOpen: boolean;
  selectedFilters?: Filters;
  selectedFundType: string | null;
  onClose: (filters?: Filters) => void;
  time?: DateTime;
  hideDateRange?: boolean;
}

export interface Filters {
  selectedDateRange: DateRange | null;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  /**
   * A specific calendar year chosen from the MPGA date-range dropdown. When set,
   * the range resolves to Jan 1 – Dec 31 of the selected year.
   */
  selectedYear?: number | null;
  /**
   * `null` means no explicit selection: every available category is shown as
   * checked and the report aggregates all of them.
   */
  categories: string[] | null;
}

export const getValidationSchema = (currentTime: DateTime) =>
  yup.object({
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
      )
      .test(
        'start-date-not-future-without-end',
        i18n.t(
          'Select an end date when the start date is later than the month being viewed',
        ),
        function (value) {
          const { endDate } = this.parent;
          if (!value || endDate) {
            return true;
          }

          return value <= currentTime.endOf('month');
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
    categories: yup.array().of(yup.string()).nullable(),
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
  const selectedYear = values.selectedYear;

  if (selectedYear !== null && selectedYear !== undefined) {
    const yearStart = DateTime.fromObject({
      year: selectedYear,
    }).startOf('year');
    finalValues.startDate = yearStart;
    finalValues.endDate = yearStart.endOf('year');
    return finalValues;
  }
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
  selectedFundType,
  time,
  hideDateRange,
}) => {
  const { t } = useTranslation();
  const [previewFilters, setPreviewFilters] = useState<Filters | null>(null);

  const currentTime = useMemo(
    () => time ?? DateTime.now().startOf('month'),
    [time],
  );

  // TODO: Get list of all possible years
  const completedYears = useMemo(() => {
    const lastCompletedYear = currentTime.year - 1;
    return Array.from({ length: 5 }, (_, index) => lastCompletedYear - index);
  }, [currentTime]);

  const validationSchema = useMemo(
    () => getValidationSchema(currentTime),
    [currentTime],
  );

  const handleClose = () => {
    setPreviewFilters(null);
    onClose(selectedFilters);
  };

  const getQueryVariables = (filterParams: Filters | null) => ({
    fundTypes: selectedFundType ? [selectedFundType] : null,
    ...getStaffExpenseMonthRange(filterParams, currentTime),
  });

  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useReportsStaffExpensesQuery({
    variables: getQueryVariables(previewFilters ?? selectedFilters ?? null),
    skip: !isOpen,
    fetchPolicy: 'no-cache',
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

  const initialValues: Filters = {
    selectedDateRange: selectedFilters?.selectedDateRange ?? null,
    startDate:
      selectedFilters?.selectedDateRange === null
        ? selectedFilters?.startDate
        : null,
    endDate:
      selectedFilters?.selectedDateRange === null
        ? selectedFilters?.endDate
        : null,
    selectedYear: selectedFilters?.selectedYear ?? null,
    categories: selectedFilters?.categories ?? null,
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
          const handleCategoryToggle = (category: string, checked: boolean) => {
            const selectedCategories = values.categories ?? availableCategories;
            const newCategories = checked
              ? [...selectedCategories, category]
              : selectedCategories.filter(
                  (selectedCategory) => selectedCategory !== category,
                );
            setFieldValue('categories', newCategories);
          };

          const dropdownValue =
            values.selectedYear !== null && values.selectedYear !== undefined
              ? String(values.selectedYear)
              : (values.selectedDateRange ?? '');

          return (
            <Form>
              <DialogContent>
                <TextField
                  select
                  label={t('Select Date Range')}
                  fullWidth
                  value={dropdownValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const isYear = /^\d{4}$/.test(raw);
                    const yearValue = isYear ? Number(raw) : null;
                    const rangeValue =
                      isYear || raw === '' ? null : (raw as DateRange);

                    setFieldValue('selectedYear', yearValue);
                    setFieldValue('selectedDateRange', rangeValue);
                    setFieldValue('startDate', null);
                    setFieldValue('endDate', null);
                    setTouched({
                      ...touched,
                      startDate: false,
                      endDate: false,
                    });

                    validateAndRefetch(validateForm, {
                      ...values,
                      selectedYear: yearValue,
                      selectedDateRange: rangeValue,
                      startDate: null,
                      endDate: null,
                    });
                  }}
                >
                  <MenuItem value="">{t('None')}</MenuItem>
                  {!hideDateRange && [
                    <MenuItem key="weekToDate" value={DateRange.WeekToDate}>
                      {t('Week to Date')}
                    </MenuItem>,
                    <MenuItem key="monthToDate" value={DateRange.MonthToDate}>
                      {t('Month to Date')}
                    </MenuItem>,
                  ]}
                  <MenuItem value={DateRange.YearToDate}>
                    {t('Year to Date')}
                  </MenuItem>
                  {hideDateRange &&
                    completedYears.map((year) => (
                      <MenuItem key={year} value={String(year)}>
                        {year}
                      </MenuItem>
                    ))}
                </TextField>

                {!hideDateRange && (
                  <>
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
                          errors.endDate && touched.endDate
                            ? errors.endDate
                            : ''
                        }
                      />
                    </Box>
                  </>
                )}

                <Typography sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {t(
                    `Income and expenses are combined by categories by default. This may be useful for long date ranges (e.g., "Year to Date").\nSelect which categories to keep consolidated.`,
                  )}
                </Typography>

                <Typography sx={{ mt: 2, mb: 1 }}>
                  {t('Select Categories:')}
                </Typography>

                {categoryLoading ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
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
                              checked={
                                !values.categories ||
                                values.categories.includes(category)
                              }
                              onChange={(e) =>
                                handleCategoryToggle(category, e.target.checked)
                              }
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
