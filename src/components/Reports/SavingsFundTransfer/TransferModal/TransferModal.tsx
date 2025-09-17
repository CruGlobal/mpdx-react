import { useMemo, useState } from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Alert,
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
  Tooltip,
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
import { FundFieldsFragment } from '../ReportsSavingsFund.generated';
import {
  useCreateRecurringTransferMutation,
  useCreateTransferMutation,
  useUpdateRecurringTransferMutation,
} from '../TransferMutations.generated';
import { useUpdatedAtContext } from '../UpdatedAtContext/UpdateAtContext';
import { ScheduleEnum, TransferModalData, TransferTypeEnum } from '../mockData';
import { TransferModalSelect } from './TransferModalSelect/TransferModalSelect';

interface TransferFormValues {
  transferFrom: string;
  transferTo: string;
  schedule: ScheduleEnum;
  transferDate: DateTime<boolean>;
  endDate: DateTime<boolean> | null;
  amount: number;
  note: string;
}

const getToday = (): DateTime => {
  return DateTime.local().startOf('day');
};

const getTomorrow = (): DateTime => {
  return getToday().plus({ days: 1 });
};

const transferSchema = (funds: FundFieldsFragment[]) =>
  yup.object({
    transferFrom: yup.string().required(i18n.t('From account is required')),
    transferTo: yup.string().required(i18n.t('To account is required')),
    schedule: yup
      .mixed<ScheduleEnum>()
      .oneOf(Object.values(ScheduleEnum))
      .required(i18n.t('Schedule is required')),
    transferDate: yup
      .date()
      .required(i18n.t('Transfer date is required'))
      .test('start-date', function (value) {
        if (!value) {
          return false;
        }
        const selected = DateTime.fromJSDate(value).startOf('day');
        const { schedule, originalStart, isEditing } = this.parent as {
          schedule: ScheduleEnum;
          originalStart?: DateTime<boolean> | null;
          isEditing?: boolean;
        };
        if (!value) {
          return false;
        }
        if (isEditing) {
          const baseline = originalStart
            ? originalStart.startOf('day')
            : getToday();
          if (selected >= baseline) {
            return true;
          }

          return this.createError({
            message: i18n.t('Transfer date cannot be earlier than {{date}}', {
              date: baseline.toFormat('LLL dd, yyyy'),
            }),
          });
        }

        const minimum =
          schedule === ScheduleEnum.OneTime ? getToday() : getTomorrow();
        if (selected >= minimum) {
          return true;
        }

        return this.createError({
          message: i18n.t(
            'Recurring transfers must start at least one day in the future',
          ),
        });
      }),
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
      .min(0.01, i18n.t('Amount must be at least $0.01'))
      .test(
        'deficit-limit',
        i18n.t(
          'This amount will cause your account balance to exceed the deficit limit',
        ),
        function (value) {
          const { transferFrom } = this.parent;
          if (!value || !transferFrom) {
            return true;
          }
          const fund = funds.find((f) => f.fundType === transferFrom);
          if (!fund) {
            return true;
          }
          return fund.balance - value >= -fund.deficitLimit;
        },
      ),
    note: yup.string().nullable(),
  });
interface TransferModalProps {
  data: TransferModalData;
  funds: FundFieldsFragment[];
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

  const [createRecurringTransfer] = useCreateRecurringTransferMutation({
    refetchQueries: ['ReportsSavingsFundTransfer', 'AccountFunds'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setUpdatedAt();
    },
  });
  const [createTransferMutation] = useCreateTransferMutation({
    refetchQueries: ['ReportsSavingsFundTransfer', 'AccountFunds'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setUpdatedAt();
    },
  });
  const [updateRecurringTransfer] = useUpdateRecurringTransferMutation({
    refetchQueries: ['ReportsSavingsFundTransfer', 'AccountFunds'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setUpdatedAt();
    },
  });

  const validationSchema = useMemo(() => transferSchema(funds), [funds]);

  const { setUpdatedAt } = useUpdatedAtContext();

  const type = data.type || TransferTypeEnum.New;
  const isNew = type === TransferTypeEnum.New;
  const isEdit = type === TransferTypeEnum.Edit;

  const title =
    type === TransferTypeEnum.New
      ? t('New Fund Transfer')
      : t('Edit Fund Transfer');

  const handleSubmit = async (_values: TransferFormValues) => {
    setSubmitting(true);

    const {
      transferFrom,
      transferTo,
      amount,
      schedule,
      transferDate,
      endDate,
      note,
    } = _values;

    const convertedTransferDate = transferDate.toISO() ?? '';
    const convertedEndDate = endDate?.toISO() ?? null;

    const successMessage =
      type === TransferTypeEnum.New
        ? t('Transfer created successfully')
        : t('Transfer updated successfully');
    const errorMessage =
      type === TransferTypeEnum.New
        ? t('Failed to create transfer')
        : t('Failed to update transfer');

    const isOneTime = schedule === ScheduleEnum.OneTime;

    try {
      if (isNew && !isOneTime) {
        await createRecurringTransfer({
          variables: {
            amount: amount,
            sourceFundTypeName: transferFrom,
            destinationFundTypeName: transferTo,
            recurringStart: convertedTransferDate,
            recurringEnd: convertedEndDate,
          },
        });
      }

      if (isNew && isOneTime) {
        await createTransferMutation({
          variables: {
            amount: amount,
            sourceFundTypeName: transferFrom,
            destinationFundTypeName: transferTo,
            description: note,
          },
        });
      }

      if (isEdit && !isOneTime) {
        await updateRecurringTransfer({
          variables: {
            id: data.transfer.recurringId ?? '',
            amount: amount,
            recurringStart: convertedTransferDate,
            recurringEnd: convertedEndDate,
          },
        });
      }

      setUpdatedAt();

      enqueueSnackbar(successMessage, {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      enqueueSnackbar(errorMessage, {
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
          transferFrom: data.transfer.transferFrom ?? '',
          transferTo: data.transfer.transferTo ?? '',
          amount: data.transfer.amount ?? 0,
          schedule: data.transfer.schedule ?? ScheduleEnum.OneTime,
          status: data.transfer.status ?? '',
          transferDate: data.transfer.transferDate ?? getToday(),
          endDate: data.transfer.endDate ?? null,
          note: data.transfer.note ?? '',
          isEditing: Boolean(data.transfer.id),
          originalStart: data.transfer.transferDate ?? null,
        }}
        validationSchema={validationSchema}
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
            note,
          },
          isSubmitting,
          isValid,
          touched,
          errors,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldTouched,
          validateField,
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
                        notSelected={transferTo}
                        funds={funds}
                        label={t('From Account')}
                        labelId="transferFrom"
                        name="transferFrom"
                        value={transferFrom}
                        disabled={isEdit}
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
                    {type === TransferTypeEnum.New && (
                      <IconButton
                        onClick={() => {
                          setFieldValue('transferFrom', transferTo);
                          setFieldValue('transferTo', transferFrom);
                        }}
                        color="primary"
                        disabled={!transferFrom || !transferTo}
                      >
                        <Tooltip title={t('Swap')}>
                          <SwapHorizIcon />
                        </Tooltip>
                      </IconButton>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={5.5}>
                    <FormControl fullWidth>
                      <InputLabel id="transferTo">{t('To Account')}</InputLabel>
                      <TransferModalSelect
                        notSelected={transferFrom}
                        funds={funds}
                        label={t('To Account')}
                        labelId="transferTo"
                        name="transferTo"
                        disabled={isEdit}
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
                  disabled={isEdit}
                >
                  <FormLabel component="legend">{t('Schedule')}</FormLabel>
                  <RadioGroup
                    row
                    name="schedule"
                    value={schedule}
                    onChange={(_event, value) => {
                      setFieldValue('schedule', value);
                      if (value === ScheduleEnum.Monthly) {
                        setFieldTouched('transferDate', true, false);
                        validateField('transferDate');
                      } else {
                        validateField('transferDate');
                      }
                    }}
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
                  {schedule === ScheduleEnum.OneTime ? (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('Transfer Date')}
                        value={transferDate.toFormat('MM/dd/yyyy')}
                        disabled={true}
                      />
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={6}>
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
                            touched.transferDate &&
                            (errors.transferDate as string)
                          }
                          required
                        />
                      </Grid>

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
                        />
                      </Grid>
                    </>
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

              {schedule === ScheduleEnum.OneTime && (
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth>
                    <TextField
                      id="transfer-note"
                      label={t('Note (Optional)')}
                      name="note"
                      disabled={isEdit}
                      value={note}
                      onChange={handleChange}
                      fullWidth
                    />
                  </FormControl>
                </Box>
              )}

              {schedule === ScheduleEnum.Monthly && isNew && (
                <Alert severity="info">
                  {t(
                    'Recurring transfers will appear after the first scheduled payment is processed tomorrow.',
                  )}
                </Alert>
              )}
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
