import React, { ReactElement, useState } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { FormFieldsGridContainer } from 'src/components/Task/Modal/Form/Container/FormFieldsGridContainer';
import { DonorAccountAutocomplete } from 'src/components/common/DonorAccountAutocomplete/DonorAccountAutocomplete';
import {
  CancelButton,
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { requiredDateTime } from 'src/lib/formikHelpers';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import { SmallLoadingSpinner } from '../Settings/Organization/LoadingSpinner';
import { CustomDateField } from '../common/DateTimePickers/CustomDateField';
import { DeleteConfirmation } from '../common/Modal/DeleteConfirmation/DeleteConfirmation';
import {
  EditDonationModalDonationFragment,
  useDeleteDonationMutation,
  useEditDonationModalGetAppealsQuery,
  useGetDesignationAccountsQuery,
  useUpdateDonationMutation,
} from './EditDonationModal.generated';

interface EditDonationModalProps {
  open: boolean;
  donation: EditDonationModalDonationFragment;
  handleClose: () => void;
}

const donationSchema = yup.object({
  convertedAmount: yup.number().required(),
  currency: yup.string().required(),
  date: requiredDateTime(),
  donorAccountId: yup.string().required(),
  designationAccountId: yup.string().required(),
  appealId: yup.string().optional(),
  appealAmount: yup.number(),
  memo: yup.string().optional(),
});

type Attributes = yup.InferType<typeof donationSchema>;

export const EditDonationModal: React.FC<EditDonationModalProps> = ({
  open,
  donation,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const accountListId = useAccountListId() ?? '';
  const constants = useApiConstants();

  const pledgeCurrencies = constants?.pledgeCurrency;

  const {
    data: appeals,
    error,
    fetchMore,
  } = useEditDonationModalGetAppealsQuery({
    variables: { accountListId },
  });
  const { loading: loadingAppeals } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: appeals?.appeals.pageInfo,
  });

  const { data: designationAccounts, loading: loadingDesignationAccounts } =
    useGetDesignationAccountsQuery({ variables: { accountListId } });

  const [updateDonation, { loading: updatingDonation }] =
    useUpdateDonationMutation();

  const [deleteDonation, { loading: deletingDonation }] =
    useDeleteDonationMutation();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (fields: Attributes) => {
    await updateDonation({
      variables: {
        accountListId,
        attributes: {
          id: donation.id,
          appealId: fields.appealId,
          appealAmount: parseFloat(fields.appealAmount as unknown as string),
          amount: parseFloat(fields.convertedAmount as unknown as string),
          currency: fields.currency,
          designationAccountId: fields.designationAccountId,
          donationDate: fields.date.toISODate(),
          donorAccountId: fields.donorAccountId,
          memo: fields.memo,
        },
      },
      refetchQueries: ['GetDonationsTable'],
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
        id: donation.id,
      },
      update: (cache) => {
        cache.evict({ id: `Donation:${donation.id}` });
      },
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
        initialValues={{
          convertedAmount: donation.amount.amount,
          currency: donation.amount.currency,
          date: DateTime.fromISO(donation.donationDate),
          appealId: donation.appeal?.id ?? '',
          appealAmount: donation.appealAmount?.amount,
          designationAccountId: donation.designationAccount.id,
          donorAccountId: donation.donorAccount.id,
          memo: donation.memo ?? '',
        }}
        validationSchema={donationSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            convertedAmount,
            currency,
            date,
            donorAccountId,
            designationAccountId,
            appealId,
            appealAmount,
            memo,
          },
          setFieldValue,
          handleChange,
          handleBlur,
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
                    name="convertedAmount"
                    value={convertedAmount}
                    label={t('Amount')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    inputProps={{ 'aria-label': t('Amount') }}
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
                  <FormControl fullWidth required>
                    <InputLabel id="currency-select-label">
                      {t('Currency')}
                    </InputLabel>
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
                      {getPledgeCurrencyOptions(pledgeCurrencies)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <CustomDateField
                      label={t('Date')}
                      value={date}
                      onChange={(date) => setFieldValue('date', date)}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    value={donation.motivation}
                    label={t('Motivation')}
                    fullWidth
                    inputProps={{ 'aria-label': t('Motivation') }}
                    disabled
                  />
                </Grid>
                {donation.remoteId && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={donation.remoteId}
                      label={t('Gift ID')}
                      fullWidth
                      inputProps={{ 'aria-label': t('Gift ID') }}
                      disabled
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <DonorAccountAutocomplete
                    accountListId={accountListId}
                    value={donorAccountId}
                    preloadedDonors={[
                      {
                        id: donation.donorAccount.id,
                        name: donation.donorAccount.displayName,
                      },
                    ]}
                    onChange={(donorAccountId) =>
                      setFieldValue('donorAccountId', donorAccountId)
                    }
                    label={t('Partner Account')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
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
                        loadingDesignationAccounts && (
                          <SmallLoadingSpinner spacing="25px" />
                        )
                      }
                    >
                      {designationAccounts?.designationAccounts
                        .flatMap(
                          (designationAccount) =>
                            designationAccount.designationAccounts,
                        )
                        .map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.name
                              ? account.name
                              : account.designationNumber}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="appealId">{t('Appeal')}</InputLabel>
                    <Select
                      labelId="appealId"
                      label={t('Appeal')}
                      value={appealId}
                      onChange={(e) =>
                        setFieldValue('appealId', e.target.value)
                      }
                      endAdornment={
                        loadingAppeals && <SmallLoadingSpinner spacing="25px" />
                      }
                    >
                      {appealId !== '' && (
                        <MenuItem key={null} value="">
                          <em>{t('None')}</em>
                        </MenuItem>
                      )}
                      {appeals?.appeals.nodes.map((appeal) => (
                        <MenuItem key={appeal.id} value={appeal.id}>
                          {appeal.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {appealId && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      value={appealAmount}
                      label={t('Appeal Amount')}
                      onChange={handleChange('appealAmount')}
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    value={memo}
                    label={t('Memo')}
                    onChange={handleChange('memo')}
                    fullWidth
                  />
                </Grid>
              </FormFieldsGridContainer>
            </DialogContent>
            <DialogActions>
              <DeleteButton onClick={() => setRemoveDialogOpen(true)} />
              <CancelButton disabled={isSubmitting} onClick={handleClose} />
              <SubmitButton disabled={isSubmitting || !isValid}>
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
              <DeleteConfirmation
                deleteType={t('donation')}
                open={removeDialogOpen}
                onClickConfirm={handleDelete}
                onClickDecline={() => setRemoveDialogOpen(false)}
                aria-labelledby={t('Remove donation confirmation')}
              />
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
