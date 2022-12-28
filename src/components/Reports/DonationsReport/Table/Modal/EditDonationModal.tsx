import CalendarToday from '@mui/icons-material/CalendarToday';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeleteButton,
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { FormFieldsGridContainer } from 'src/components/Task/Modal/Form/Container/FormFieldsGridContainer';
import theme from 'src/theme';
import * as yup from 'yup';
import { Donation } from '../DonationsReportTable';

interface EditDonationModalProps {
  open: boolean;
  donation?: Donation | null | undefined;
  handleClose: () => void;
}

const donationSchema = yup.object({
  convertedAmount: yup.string().nullable(),
  currency: yup.string().nullable(),
  date: yup.string().nullable(),
  motivation: yup.string().nullable(),
  giftId: yup.string().nullable(),
  partner: yup.string().nullable(),
  designation: yup.string().nullable(),
  appeal: yup.string().nullable(),
  appealAmount: yup.string().nullable(),
  memo: yup.string().nullable(),
});

const initialDonation = {
  convertedAmount: '',
  currency: '',
  date: '',
  motivation: '',
  giftId: '',
  partner: '',
  designation: '',
  appeal: '',
  appealAmount: '',
  memo: '',
};

export const EditDonationModal: React.FC<EditDonationModalProps> = ({
  open,
  donation,
  handleClose,
}) => {
  const { t } = useTranslation();
  const constants = useApiConstants();

  const pledgeCurrencies = constants?.pledgeCurrencies;

  const onSubmit = async (attributes) => {
    console.log(attributes);
  };
  return (
    <Modal title={t('Edit Donation')} isOpen={open} handleClose={handleClose}>
      <Formik
        initialValues={donation ? donation : initialDonation}
        validationSchema={donationSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            convertedAmount,
            currency,
            date,
            motivation,
            giftId,
            partner,
            designation,
            appeal,
            appealAmount,
            memo,
          },
          setFieldValue,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
          touched,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <FormFieldsGridContainer>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={convertedAmount}
                    label={t('Amount')}
                    onChange={handleChange('convertedAmount')}
                    fullWidth
                    inputProps={{ 'aria-label': 'Amount' }}
                    error={!!errors.convertedAmount && touched.convertedAmount}
                    helperText={
                      errors.convertedAmount &&
                      touched.convertedAmount &&
                      t('Field is required')
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="currency-select-label">
                      {t('Currency')}
                    </InputLabel>
                    {pledgeCurrencies && (
                      <Select
                        label={t('Currency')}
                        labelId="currency-select-label"
                        value={currency ?? ''}
                        onChange={(e) =>
                          setFieldValue('currency', e.target.value)
                        }
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          PaperProps: {
                            style: {
                              maxHeight: '300px',
                              overflow: 'auto',
                            },
                          },
                        }}
                      >
                        <MenuItem value={''} disabled></MenuItem>
                        {pledgeCurrencies?.map(
                          ({ value, id }) =>
                            value &&
                            id && (
                              <MenuItem key={id} value={id}>
                                {t(value)}
                              </MenuItem>
                            ),
                        )}
                      </Select>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <MobileDatePicker
                      renderInput={(params) => (
                        <TextField fullWidth {...params} />
                      )}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarToday
                              style={{
                                color: theme.palette.cruGrayMedium.main,
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      inputFormat="MMM dd, yyyy"
                      closeOnSelect
                      label={t('Date')}
                      value={date}
                      onChange={(date): void => setFieldValue('date', date)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={motivation}
                    label={t('Motivation')}
                    onChange={handleChange('motivation')}
                    fullWidth
                    inputProps={{ 'aria-label': 'motivation' }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={giftId}
                    label={t('Gift ID')}
                    onChange={handleChange('giftId')}
                    fullWidth
                    inputProps={{ 'aria-label': 'giftId' }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="parnter">{t('Partner Account')}</InputLabel>
                    <Select
                      labelId="partner"
                      label={t('Partner Account')}
                      value={partner}
                      onChange={(e) => setFieldValue('partner', e.target.value)}
                    >
                      <MenuItem value={partner}>{partner}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="designation">
                      {t('Designation Account')}
                    </InputLabel>
                    <Select
                      labelId="designation"
                      label={t('Designation Account')}
                      value={designation}
                      onChange={(e) =>
                        setFieldValue('designation', e.target.value)
                      }
                    >
                      <MenuItem value={designation}>{designation}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="appeal">{t('Appeal')}</InputLabel>
                    <Select
                      labelId="appeal"
                      label={t('Appeal')}
                      value={appeal}
                      onChange={(e) => setFieldValue('appeal', e.target.value)}
                    >
                      <MenuItem value={appeal}>{appeal}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={memo}
                    label={t('Memo')}
                    onChange={handleChange('memo')}
                    fullWidth
                    inputProps={{ 'aria-label': 'Memo' }}
                  />
                </Grid>
              </FormFieldsGridContainer>
            </DialogContent>
            <DialogActions>
              {/* {task?.id ? (
                <DeleteButton onClick={() => setRemoveDialogOpen(true)} />
              ) : null} */}
              <CancelButton disabled={isSubmitting} onClick={handleClose} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {/* {creating && (
                  <>
                    <CircularProgress color="primary" size={20} />
                    &nbsp;
                  </>
                )} */}
                {t('Save')}
              </SubmitButton>
              {/* 
              <Dialog
                open={removeDialogOpen}
                aria-labelledby={t('Remove task confirmation')}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>{t('Confirm')}</DialogTitle>
                <DialogContent dividers>
                  {deleting ? (
                    <LoadingIndicator color="primary" size={50} />
                  ) : (
                    <DialogContentText>
                      {t('Are you sure you wish to delete the selected task?')}
                    </DialogContentText>
                  )}
                </DialogContent>
                <DialogActions>
                  <CancelButton onClick={() => setRemoveDialogOpen(false)}>
                    {t('No')}
                  </CancelButton>
                  <SubmitButton type="button" onClick={onDeleteTask}>
                    {t('Yes')}
                  </SubmitButton>
                </DialogActions>
              </Dialog> */}
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
