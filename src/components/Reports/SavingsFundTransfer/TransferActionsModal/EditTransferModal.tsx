import React, { useState } from 'react';
import { SwapHoriz } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
import { requiredDateTime } from 'src/lib/formikHelpers';
import i18n from 'src/lib/i18n';
import { Schedule, Status } from '../Helper/TransferHistoryEnum';
import {
  TransferHistory,
  staffAccount,
  staffConferenceSavings,
  staffSavings,
} from '../Table/TransferHistoryTable';
import { Fund, StaffSavingFund } from '../mockData';

const InputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(2, 0),
}));

const DateInteractive = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  '& input.MuiInputBase-input, & fieldset': {
    opacity: isDisabled ? '0.4' : '1',
  },
}));

const validationSchema = yup.object({
  transferFrom: yup.string().required(),
  transferTo: yup.string().required(),
  amount: yup.number().required(i18n.t('Amount is required')),
  schedule: yup.string().required(),
  status: yup.string().required(),
  transferDate: requiredDateTime(i18n.t('Transfer date is required')),
  stopDate: requiredDateTime(i18n.t('Stop date is required')),
  note: yup.string().nullable(),
});

type Attributes = yup.InferType<typeof validationSchema>;

interface EditTransferModalProps {
  handleClose: () => void;
  transfer: TransferHistory;
  funds: Fund[];
}

export const EditTransferModal: React.FC<EditTransferModalProps> = ({
  transfer,
  handleClose,
  funds,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [editing, setEditing] = useState(false);

  const onSubmit = () => {
    setEditing(true);

    enqueueSnackbar(t('Transfer updated successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  const [transferFrom, transferTo] = transfer.transfers.split(' to ');

  return (
    <Modal
      title={t('Edit Transfer')}
      isOpen={true}
      handleClose={handleClose}
      size="md"
    >
      <Formik<Attributes>
        initialValues={{
          transferFrom: transferFrom,
          transferTo: transferTo,
          amount: transfer.amount,
          schedule: transfer.schedule,
          status: transfer.status,
          transferDate: DateTime.fromISO(transfer.transferDate),
          stopDate: DateTime.fromISO(transfer.stopDate),
          note: transfer.note,
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            transferFrom,
            transferTo,
            amount,
            schedule,
            status,
            transferDate,
            stopDate,
            note,
          },
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
          isValid,
          touched,
          errors,
          handleBlur,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers sx={{ maxHeight: '60vh' }}>
              <Grid container>
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={5.5}>
                    <InputWrapper>
                      <FormControl fullWidth>
                        <InputLabel id="transfer-from-select-label">
                          {t('From')}
                        </InputLabel>
                        <Select
                          label={t('From')}
                          labelId="transfer-from-select-label"
                          value={transferFrom}
                          onChange={(e) =>
                            setFieldValue('transferFrom', e.target.value)
                          }
                          fullWidth={true}
                        >
                          {funds.map((fund) => (
                            <MenuItem key={fund.type} value={fund.type}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {fund.type === StaffSavingFund.StaffAccount
                                  ? staffAccount
                                  : fund.type === StaffSavingFund.StaffSavings
                                  ? staffSavings
                                  : fund.type ===
                                    StaffSavingFund.StaffConferenceSavings
                                  ? staffConferenceSavings
                                  : null}{' '}
                                <strong>{fund.name}</strong>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </InputWrapper>
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
                    <IconButton>
                      <SwapHoriz
                        onClick={() => {
                          setFieldValue('transferFrom', transferTo);
                          setFieldValue('transferTo', transferFrom);
                        }}
                      />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12} sm={5.5}>
                    <InputWrapper>
                      <FormControl fullWidth>
                        <InputLabel id="transfer-to-select-label">
                          {t('To')}
                        </InputLabel>
                        <Select
                          label={t('To')}
                          labelId="transfer-to-select-label"
                          value={transferTo}
                          onChange={(e) =>
                            setFieldValue('transferTo', e.target.value)
                          }
                          fullWidth={true}
                        >
                          {funds
                            .filter((fund) => fund.type !== transferFrom)
                            .map((fund) => (
                              <MenuItem key={fund.type} value={fund.type}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {fund.type === StaffSavingFund.StaffAccount
                                    ? staffAccount
                                    : fund.type === StaffSavingFund.StaffSavings
                                    ? staffSavings
                                    : fund.type ===
                                      StaffSavingFund.StaffConferenceSavings
                                    ? staffConferenceSavings
                                    : null}{' '}
                                  <strong>{fund.name}</strong>
                                </Box>
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </InputWrapper>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputWrapper>
                    <TextField
                      id="transfer-amount-label"
                      label={t('Amount')}
                      name="amount"
                      value={amount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      error={!!errors.amount && touched.amount}
                      helperText={
                        errors.amount && touched.amount ? errors.amount : ''
                      }
                      required
                    />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper>
                    <FormControl>
                      <FormLabel id="schedule-select-label">
                        {t('Schedule')}
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="schedule-select-label"
                        name="schedule-select-label"
                        value={schedule}
                        onChange={(e) =>
                          setFieldValue('schedule', e.target.value)
                        }
                      >
                        <FormControlLabel
                          value={Schedule.OneTime}
                          control={<Radio />}
                          label={t('One Time')}
                        />
                        <FormControlLabel
                          value={Schedule.Monthly}
                          control={<Radio />}
                          label={t('Monthly')}
                        />
                      </RadioGroup>
                    </FormControl>
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper>
                    <FormControl fullWidth>
                      <InputLabel id="transfer-to-select-label">
                        {t('Status')}
                      </InputLabel>
                      <Select
                        label={t('Status')}
                        labelId="transfer-status-select-label"
                        value={status}
                        onChange={(e) =>
                          setFieldValue('status', e.target.value)
                        }
                        fullWidth={true}
                      >
                        <MenuItem key={Status.Pending} value={Status.Pending}>
                          {t('Pending')}
                        </MenuItem>
                        <MenuItem key={Status.Ongoing} value={Status.Ongoing}>
                          {t('Ongoing')}
                        </MenuItem>
                        <MenuItem key={Status.Complete} value={Status.Complete}>
                          {t('Complete')}
                        </MenuItem>
                        <MenuItem key={Status.Ended} value={Status.Ended}>
                          {t('Ended')}
                        </MenuItem>
                        <MenuItem key={Status.Failed} value={Status.Failed}>
                          {t('Failed')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper>
                    <CustomDateField
                      label={t('Transfer Date')}
                      value={transferDate}
                      onChange={(date) => {
                        setFieldValue('transferDate', date);
                        setFieldTouched('transferDate', true, false);
                      }}
                      error={!!(errors.transferDate && touched.transferDate)}
                      helperText={
                        touched.transferDate && (errors.transferDate as string)
                      }
                      required
                    />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper>
                    {schedule !== Schedule.OneTime ? (
                      <CustomDateField
                        label={t('Stop Date')}
                        value={stopDate}
                        onChange={(date) => {
                          setFieldValue('stopDate', date);
                          setFieldTouched('stopDate', true, false);
                        }}
                        error={!!(errors.stopDate && touched.stopDate)}
                        helperText={
                          touched.stopDate && (errors.stopDate as string)
                        }
                        required
                      />
                    ) : (
                      <DateInteractive
                        label={t('Stop Date')}
                        isDisabled={true}
                        disabled={true}
                        aria-readonly={true}
                        value={''}
                        InputProps={{
                          endAdornment: (
                            <Tooltip
                              title={
                                <Typography>
                                  {t(
                                    'One-time transfers do not require a stop date.',
                                  )}
                                </Typography>
                              }
                            >
                              <InfoIcon />
                            </Tooltip>
                          ),
                        }}
                        fullWidth
                      >
                        <MenuItem value={''} disabled></MenuItem>
                      </DateInteractive>
                    )}
                  </InputWrapper>
                </Grid>
                <Grid item xs={12}>
                  <InputWrapper>
                    <FormControl fullWidth>
                      <TextField
                        id="transfer-note"
                        label={t('Note')}
                        value={note}
                        onChange={(e) => setFieldValue('note', e.target.value)}
                        fullWidth
                      />
                    </FormControl>
                  </InputWrapper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <CancelButton
                onClick={handleClose}
                disabled={editing || isSubmitting}
              >
                {t('Cancel')}
              </CancelButton>
              <SubmitButton
                disabled={editing || isSubmitting || !isValid}
                onClick={onSubmit}
              >
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
