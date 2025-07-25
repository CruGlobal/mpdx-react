import React from 'react';
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
  selectedDateRange?: DateRange | null;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  // change to enum array when category data is provided
  categories?: string[] | null;
}

const validationSchema = Yup.object({
  selectedDateRange: Yup.mixed().nullable(),
  startDate: Yup.mixed().nullable(),
  endDate: Yup.mixed()
    .nullable()
    .test(
      'end-after-start',
      'End date must be after start date',
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) {
          return true;
        }
        return value >= startDate;
      },
    ),
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
    // consider a default case if needed
  }
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
}) => {
  const { t } = useTranslation();

  const initialValues = {
    selectedDateRange: selectedFilters?.selectedDateRange ?? null,
    startDate: selectedFilters?.startDate ?? null,
    endDate: selectedFilters?.endDate ?? null,
    categories: selectedFilters?.categories ?? [],
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('Report Settings')}</DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          const finalValues = values;
          if (values.selectedDateRange !== null) {
            const { startDate, endDate } = calculateDateRange(
              values.selectedDateRange,
            );
            finalValues.startDate = startDate;
            finalValues.endDate = endDate;
          }
          onClose(finalValues);
        }}
      >
        {({ values, setFieldValue, isValid, dirty, resetForm }) => (
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
                  // Clear custom dates when predefined range is selected
                  if (value) {
                    setFieldValue('startDate', null);
                    setFieldValue('endDate', null);
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
                    // Clear predefined range when custom date is set
                    if (date) {
                      setFieldValue('selectedDateRange', null);
                    }
                  }}
                  fullWidth
                />
                <CustomDateField
                  label={t('End Date')}
                  value={values.endDate}
                  onChange={(date) => {
                    setFieldValue('endDate', date);
                    // Clear predefined range when custom date is set
                    if (date) {
                      setFieldValue('selectedDateRange', null);
                    }
                  }}
                  fullWidth
                />
              </Box>

              <Typography sx={{ mt: 2 }}>
                If you like, you can combine certain categories of data into
                single rows. This may be useful when using long date ranges,
                such as &quot;Year to Date.&quot; Select which categories of
                items you wish to consolidate (each category is still kept
                separate from the other categories).{' '}
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
                disabled={!dirty || !isValid}
              >
                {t('Apply Filters')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
