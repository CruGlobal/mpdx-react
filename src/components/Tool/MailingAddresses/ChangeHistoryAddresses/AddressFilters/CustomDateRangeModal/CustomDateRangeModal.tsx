import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CustomDateField } from 'src/components/Shared/DateTimePickers/CustomDateField';
import { nullableDateTime } from 'src/lib/yupHelpers';
import { DateRange } from '../../helpers';

interface CustomDateRangeModalProps {
  initialRange: DateRange | null;
  handleClose: () => void;
  handleApply: (range: DateRange) => void;
}

const getDateRangeSchema = (t: TFunction) =>
  yup.object({
    startDate: nullableDateTime(),
    endDate: nullableDateTime().test(
      'not-before-start',
      t('End date cannot be before the start date'),
      function (endDate) {
        const { startDate } = this.parent as DateRange;
        return !startDate || !endDate || endDate >= startDate;
      },
    ),
  });

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  initialRange,
  handleClose,
  handleApply,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <Formik<DateRange>
        initialValues={{
          startDate: initialRange?.startDate ?? null,
          endDate: initialRange?.endDate ?? null,
        }}
        validationSchema={getDateRangeSchema(t)}
        onSubmit={handleApply}
      >
        {({ values, errors, touched, setFieldValue, setFieldTouched }) => (
          <Form>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              {t('Custom Date Range')}
            </DialogTitle>
            <IconButton
              onClick={handleClose}
              aria-label={t('Close')}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
              <Typography>
                {t('Show address changes made between these dates.')}
              </Typography>
              <Grid container spacing={2} mt={2}>
                <Grid size={6}>
                  <CustomDateField
                    label={t('Start Date')}
                    value={values.startDate}
                    onChange={(date) => {
                      setFieldValue('startDate', date);
                      setFieldTouched('startDate', true, false);
                    }}
                    error={!!(errors.startDate && touched.startDate)}
                    helperText={
                      touched.startDate && (errors.startDate as string)
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={6}>
                  <CustomDateField
                    label={t('End Date')}
                    value={values.endDate}
                    onChange={(date) => {
                      setFieldValue('endDate', date);
                      setFieldTouched('endDate', true, false);
                    }}
                    error={!!(errors.endDate && touched.endDate)}
                    helperText={touched.endDate && (errors.endDate as string)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>
                <b>{t('Cancel')}</b>
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!values.startDate && !values.endDate}
              >
                <b>{t('Apply')}</b>
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
