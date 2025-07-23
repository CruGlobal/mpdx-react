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
import { DesignationAccountAutocomplete } from 'src/common/Autocompletes/DesignationAccountAutocomplete';
import { FormFieldsGridContainer } from 'src/components/Task/Modal/Form/Container/FormFieldsGridContainer';
import { CurrencyAutocomplete } from 'src/components/common/Autocomplete/CurrencyAutocomplete/CurrencyAutocomplete';
import { DonorAccountAutocomplete } from 'src/components/common/Autocomplete/DonorAccountAutocomplete/DonorAccountAutocomplete';
import {
  CancelButton,
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { requiredDateTime } from 'src/lib/formikHelpers';
import i18n from 'src/lib/i18n';
import { SmallLoadingSpinner } from '../Settings/Organization/LoadingSpinner';
import { CustomDateField } from '../common/DateTimePickers/CustomDateField';
import { DeleteConfirmation } from '../common/Modal/DeleteConfirmation/DeleteConfirmation';
import {
  EditDonationModalDonationFragment,
  useDeleteDonationMutation,
  useEditDonationModalGetAppealsQuery,
  useUpdateDonationMutation,
} from './EditDonationModal.generated';

interface EditDonationModalProps {
  open: boolean;
  donation: EditDonationModalDonationFragment;
  handleClose: () => void;
}

const donationSchema = yup.object({
  convertedAmount: yup
    .number()
    .typeError(i18n.t('Must be a number'))
    .required(i18n.t('Amount is required')),
  currency: yup.string().required(i18n.t('Currency is required')),
  date: requiredDateTime(i18n.t('Date is required')),
  donorAccountId: yup.string().required(i18n.t('Partner Account is required')),
  designationAccountId: yup
    .string()
    .required(i18n.t('Designation Account is required')),
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
          setFieldTouched,
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
                    onChange={(event) => {
                      handleChange(event);
                      setFieldTouched('convertedAmount', true, false);
                    }}
                    onBlur={handleBlur}
                    fullWidth
                    inputProps={{ 'aria-label': t('Amount') }}
                    error={!!errors.convertedAmount && touched.convertedAmount}
                    helperText={
                      touched.convertedAmount ? errors.convertedAmount : ''
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <CurrencyAutocomplete
                      disableClearable
                      disabled={isSubmitting}
                      value={currency}
                      onChange={(_, currencyCode) => {
                        setFieldValue('currency', currencyCode);
                      }}
                      textFieldProps={{
                        label: t('Currency'),
                        error: !!errors.currency && touched.currency,
                        helperText: touched.currency && errors.currency,
                        required: true,
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <CustomDateField
                      label={t('Date')}
                      value={date}
                      onChange={(date) => {
                        setFieldValue('date', date);
                        setFieldTouched('date', true, false);
                      }}
                      error={!!(errors.date && touched.date)}
                      helperText={touched.date && (errors.date as string)}
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
                    onChange={(donorAccountId) => {
                      setFieldValue('donorAccountId', donorAccountId);
                      setFieldTouched('donorAccountId', true, false);
                    }}
                    onBlur={handleBlur}
                    label={t('Partner Account')}
                    textFieldProps={{
                      error: !!errors.donorAccountId && touched.donorAccountId,
                      helperText:
                        touched.donorAccountId && errors.donorAccountId,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DesignationAccountAutocomplete
                    id="designationAccountId"
                    accountListId={accountListId}
                    value={designationAccountId}
                    onBlur={handleBlur('designationAccountId')}
                    onChange={(_, designationAccountId) =>
                      setFieldValue(
                        'designationAccountId',
                        designationAccountId,
                      )
                    }
                    textFieldProps={{
                      label: t('Designation Account'),
                      size: 'medium',
                      variant: 'outlined',
                      required: true,
                      error:
                        !!errors.designationAccountId &&
                        touched.designationAccountId,
                      helperText:
                        touched.designationAccountId &&
                        errors.designationAccountId,
                    }}
                  />
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
