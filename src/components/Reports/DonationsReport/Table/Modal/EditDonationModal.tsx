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
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DonorAccountAutocomplete } from 'src/components/common/DonorAccountAutocomplete/DonorAccountAutocomplete';
import {
  DeleteButton,
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useGetAppealsForMassActionQuery } from 'src/components/Contacts/MassActions/AddToAppeal/GetAppealsForMassAction.generated';
import { FormFieldsGridContainer } from 'src/components/Task/Modal/Form/Container/FormFieldsGridContainer';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import * as yup from 'yup';
import { GetDonationsTableDocument } from '../../GetDonationsTable.generated';
import { Donation } from '../DonationsReportTable';
import {
  useDeleteDonationMutation,
  useGetDesignationAccountsQuery,
  useUpdateDonationMutation,
} from './EditDonation.generated';

interface EditDonationModalProps {
  open: boolean;
  donation?: Donation | null | undefined;
  handleClose: () => void;
  startDate: string;
  endDate: string;
}

const donationSchema = yup.object({
  convertedAmount: yup.string().required(),
  currency: yup.string().nullable(),
  date: yup.string().nullable(),
  motivation: yup.string().nullable(),
  giftId: yup.string().nullable(),
  partnerId: yup.string().nullable(),
  designationAccountId: yup.string().nullable(),
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
  partnerId: '',
  designationAccountId: '',
  appeal: '',
  appealAmount: '',
  memo: '',
};

const LoadingSpinner: React.FC = () => (
  <CircularProgress color="primary" size={20} sx={{ marginRight: 3 }} />
);

export const EditDonationModal: React.FC<EditDonationModalProps> = ({
  open,
  donation,
  handleClose,
  startDate,
  endDate,
}) => {
  const { t } = useTranslation();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const accountListId = useAccountListId() ?? '';
  const constants = useApiConstants();

  const pledgeCurrencies = constants?.pledgeCurrencies;

  const { data: appeals, loading: loadingAppeals } =
    useGetAppealsForMassActionQuery({ variables: { accountListId } });

  const { data: designationAccounts, loading: loadingDesignationAccounts } =
    useGetDesignationAccountsQuery({ variables: { accountListId } });

  const [updateDonation, { loading: updatingDonation }] =
    useUpdateDonationMutation();

  const [deleteDonation, { loading: deletingDonation }] =
    useDeleteDonationMutation();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (fields) => {
    await updateDonation({
      variables: {
        accountListId,
        attributes: {
          appealId: fields.appeal,
          appealAmount: parseFloat(fields.appealAmount),
          motivation: fields.motivation,
          memo: fields.memo,
          id: donation?.id ?? '',
          amount: parseFloat(fields.convertedAmount),
          currency: fields.currency,
          donationDate: fields.date,
          designationAccountId: fields.designationAccountId,
          donorAccountId: fields.partnerId,
        },
      },
      refetchQueries: [
        {
          query: GetDonationsTableDocument,
          variables: { accountListId, startDate, endDate },
        },
      ],
      onCompleted: () => {
        enqueueSnackbar(t('Donation updated!'), {
          variant: 'success',
        });
        handleClose();
      },
    });
  };

  const handleDelete = async () => {
    await deleteDonation({
      variables: {
        accountListId,
        id: donation?.id ?? '',
      },
      refetchQueries: [
        {
          query: GetDonationsTableDocument,
          variables: { accountListId, startDate, endDate },
        },
      ],
      onCompleted: () => {
        enqueueSnackbar(t('Donation deleted!'), {
          variant: 'success',
        });
        handleClose();
      },
    });
  };

  return (
    <Modal title={t('Edit Donation')} isOpen={open} handleClose={handleClose}>
      <Formik
        initialValues={
          donation
            ? {
                convertedAmount: donation.convertedAmount,
                currency: donation.currency,
                date: donation.date,
                motivation: '',
                giftId: '',
                partnerId: donation.partnerId,
                designationAccountId: donation.designationAccount.id,
                appeal: donation.appeal?.id ?? '',
                appealAmount: donation.appealAmount ?? '',
                memo: '',
              }
            : initialDonation
        }
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
            partnerId,
            designationAccountId,
            appeal,
            appealAmount,
            memo,
          },
          setFieldValue,
          handleChange,
          handleSubmit,
          isSubmitting,
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
                  <DonorAccountAutocomplete
                    accountListId={accountListId}
                    value={partnerId}
                    preloadedDonors={
                      donation?.partnerId
                        ? [{ id: donation.partnerId, name: donation.partner }]
                        : undefined
                    }
                    onChange={(donorAccountId) =>
                      setFieldValue('partnerId', donorAccountId)
                    }
                    label={t('Partner Account')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="designationAccountId">
                      {t('Designation Account')}
                    </InputLabel>
                    <Select
                      labelId="designationAccountId"
                      label={t('Designation Account')}
                      value={designationAccountId}
                      onChange={(e) =>
                        setFieldValue('designationAccountId', e.target.value)
                      }
                      endAdornment={
                        loadingDesignationAccounts && <LoadingSpinner />
                      }
                    >
                      {designationAccounts?.designationAccounts
                        .flatMap(
                          (designationAccount) =>
                            designationAccount.designationAccounts,
                        )
                        .map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="appeal">{t('Appeal')}</InputLabel>
                    <Select
                      labelId="appeal"
                      label={t('Appeal')}
                      value={appeal ?? ''}
                      onChange={(e) => setFieldValue('appeal', e.target.value)}
                      endAdornment={loadingAppeals && <LoadingSpinner />}
                    >
                      {appeals?.appeals.nodes.map((appeal) => (
                        <MenuItem key={appeal.id} value={appeal.id}>
                          {appeal.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {appeal && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={appealAmount}
                      label={t('Appeal Amount')}
                      onChange={handleChange('appealAmount')}
                      fullWidth
                      inputProps={{ 'aria-label': 'appealAmount' }}
                      disabled={!appeal}
                    />
                  </Grid>
                )}
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
              <DeleteButton onClick={() => setRemoveDialogOpen(true)} />
              <CancelButton disabled={isSubmitting} onClick={handleClose} />
              <SubmitButton disabled={isSubmitting}>
                {(updatingDonation || deletingDonation) && (
                  <>
                    <CircularProgress
                      color="primary"
                      size={20}
                      data-testid="loading-circle"
                    />
                    &nbsp;
                  </>
                )}
                {t('Save')}
              </SubmitButton>

              <Dialog
                open={removeDialogOpen}
                aria-labelledby={t('Remove task confirmation')}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>{t('Confirm')}</DialogTitle>
                <DialogContent dividers>
                  <DialogContentText>
                    {t('Are you sure you wish to delete this donation?')}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <CancelButton onClick={() => setRemoveDialogOpen(false)}>
                    {t('No')}
                  </CancelButton>
                  <SubmitButton type="button" onClick={handleDelete}>
                    {t('Yes')}
                  </SubmitButton>
                </DialogActions>
              </Dialog>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
