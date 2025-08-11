import { useState } from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import i18n from 'src/lib/i18n';
import {
  TransferDirectionEnum,
  TransferTypeEnum,
} from '../Helper/TransferHistoryEnum';
import { Fund, ScheduleEnum, TransferHistory } from '../mockData';
import { TransferModalSelect } from './TransferModalSelect/TransferModalSelect';

export interface TransferModalData {
  type?: TransferTypeEnum;
  transfer: TransferHistory;
}

interface TransferFormValues {
  transferFrom: string;
  transferTo: string;
  schedule: ScheduleEnum;
  transferDate: DateTime<boolean>;
  endDate: DateTime<boolean> | null;
  amount: number;
}

const getStartOfNextMonth = (): DateTime => {
  return DateTime.utc().plus({ months: 1 }).startOf('month');
};

const transferSchema = yup.object({
  transferFrom: yup.string().required(i18n.t('From account is required')),
  transferTo: yup
    .string()
    .required(i18n.t('To account is required'))
    .test(
      'different-accounts',
      i18n.t('From and To accounts must be different'),
      function (value) {
        return value !== this.parent.transferFrom;
      },
    ),
  schedule: yup
    .mixed<ScheduleEnum>()
    .oneOf(Object.values(ScheduleEnum))
    .required(i18n.t('Schedule is required')),
  transferDate: yup.date().required(i18n.t('Transfer date is required')),
  endDate: yup
    .date()
    .nullable()
    .when('schedule', {
      is: (schedule: ScheduleEnum) => schedule !== ScheduleEnum.OneTime,
      then: (schema) =>
        schema.min(
          yup.ref('transferDate'),
          i18n.t('End date must be after transfer date'),
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  amount: yup
    .number()
    .required(i18n.t('Amount is required'))
    .positive(i18n.t('Amount must be positive'))
    .min(0.01, i18n.t('Amount must be at least $0.01')),
  note: yup.string().nullable(),
});

interface TransferModalProps {
  data: TransferModalData;
  funds: Fund[];
  handleClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  data,
  funds,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  const type = data.type || TransferTypeEnum.New;

  const {
    transferFrom,
    transferTo,
    amount,
    schedule,
    status,
    transferDate,
    endDate,
    note,
  } = data.transfer;

  const title =
    type === TransferTypeEnum.New
      ? t('New Fund Transfer')
      : t('Edit Fund Transfer');

  const handleSubmit = async (_values: TransferFormValues) => {
    setSubmitting(true);
    try {
      // Handle the submit logic here
      // TODO: Replace with actual API call
      // console.log('Form values:', values);

      enqueueSnackbar(t('Transfer successful'), {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      enqueueSnackbar(t('Transfer failed'), {
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={title} isOpen={true} handleClose={handleClose} size="md">
      <Formik
        initialValues={{
          transferFrom: transferFrom || '',
          transferTo: transferTo || '',
          amount: amount || 0,
          schedule: schedule || ScheduleEnum.OneTime,
          status: status || '',
          transferDate: transferDate || getStartOfNextMonth(),
          endDate: endDate || null,
          note: note || '',
        }}
        validationSchema={transferSchema}
        onSubmit={handleSubmit}
      >
        {({
          values: {
            transferFrom,
            transferTo,
            schedule,
            transferDate,
            endDate,
            amount,
          },
          isSubmitting,
          isValid,
          touched,
          errors,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldTouched,
          handleBlur,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('Transfer Between Accounts')}
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5.5}>
                    <FormControl fullWidth>
                      <InputLabel id="transferFrom">
                        {t('From Account')}
                      </InputLabel>
                      <TransferModalSelect
                        type={TransferDirectionEnum.From}
                        funds={funds}
                        label={t('From Account')}
                        labelId="transferFrom"
                        name="transferFrom"
                        value={transferFrom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.transferFrom && Boolean(errors.transferFrom)
                        }
                        required
                      />
                      {touched.transferFrom && errors.transferFrom && (
                        <FormHelperText error={true}>
                          {errors.transferFrom}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={1}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        setFieldValue('transferFrom', transferTo);
                        setFieldValue('transferTo', transferFrom);
                      }}
                      color="primary"
                      disabled={!transferFrom || !transferTo}
                    >
                      <SwapHorizIcon />
                    </IconButton>
                  </Grid>

                  <Grid item xs={12} sm={5.5}>
                    <FormControl fullWidth>
                      <InputLabel id="transferTo">{t('To Account')}</InputLabel>
                      <TransferModalSelect
                        type={TransferDirectionEnum.To}
                        selectedTransferFrom={transferFrom}
                        funds={funds}
                        label={t('To Account')}
                        labelId="transferTo"
                        name="transferTo"
                        value={transferTo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.transferTo && Boolean(errors.transferTo)}
                        required
                      />
                      {touched.transferTo && errors.transferTo && (
                        <FormHelperText error={true}>
                          {errors.transferTo}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl
                  component="fieldset"
                  error={touched.schedule && Boolean(errors.schedule)}
                >
                  <FormLabel component="legend">{t('Schedule')}</FormLabel>
                  <RadioGroup
                    row
                    name="schedule"
                    value={schedule}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value={ScheduleEnum.OneTime}
                      control={<Radio />}
                      label={t('One Time')}
                    />
                    <FormControlLabel
                      value={ScheduleEnum.Monthly}
                      control={<Radio />}
                      label={t('Monthly')}
                    />
                    <FormControlLabel
                      value={ScheduleEnum.Annually}
                      control={<Radio />}
                      label={t('Annually')}
                    />
                  </RadioGroup>
                  {touched.schedule && errors.schedule && (
                    <FormHelperText error={true}>
                      {errors.schedule}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={schedule === ScheduleEnum.OneTime ? 12 : 6}>
                    <CustomDateField
                      label={t('Transfer Date')}
                      value={transferDate}
                      onChange={(date) => {
                        setFieldValue('transferDate', date);
                        setFieldTouched('transferDate', true, false);
                      }}
                      error={
                        touched.transferDate && Boolean(errors.transferDate)
                      }
                      helperText={
                        touched.transferDate && (errors.transferDate as string)
                      }
                      required
                    />
                  </Grid>

                  {schedule !== ScheduleEnum.OneTime && (
                    <Grid item xs={6}>
                      <CustomDateField
                        label={t('End Date (Optional)')}
                        value={endDate}
                        onChange={(date) => {
                          setFieldValue('endDate', date);
                          setFieldTouched('endDate', true, false);
                        }}
                        error={touched.endDate && Boolean(errors.endDate)}
                        helperText={
                          touched.endDate && (errors.endDate as string)
                        }
                        required
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={t('Amount')}
                  name="amount"
                  type="number"
                  value={amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={
                    errors.amount && touched.amount ? errors.amount : ''
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  required
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <TextField
                    id="transfer-note"
                    label={t('Note')}
                    name="note"
                    value={note}
                    onChange={handleChange}
                    fullWidth
                  />
                </FormControl>
              </Box>
            </DialogContent>

            <DialogActions>
              <CancelButton
                size="large"
                disabled={submitting || isSubmitting}
                onClick={handleClose}
              />
              <SubmitButton
                size="large"
                variant="contained"
                disabled={submitting || isSubmitting || !isValid}
                type="submit"
              >
                {submitting || isSubmitting ? t('Submitting...') : t('Submit')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
