import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik, Form, FastField, FieldProps, Field } from 'formik';
import * as yup from 'yup';
import {
  Autocomplete,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { DonationCreateInput } from '../../../../../../../../../graphql/types.generated';
import { useApiConstants } from '../../../../../../../Constants/UseApiConstants';
import {
  useAddDonationMutation,
  useGetDonationModalQuery,
} from './AddDonation.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { DonorAccountAutocomplete } from 'src/components/common/DonorAccountAutocomplete/DonorAccountAutocomplete';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';

interface AddDonationProps {
  accountListId: string;
  handleClose: () => void;
}

const donationSchema: yup.SchemaOf<Omit<DonationCreateInput, 'id'>> =
  yup.object({
    amount: yup
      .number()
      .typeError('Amount must be a valid number')
      .required()
      .test(
        'Is amount in valid currency format?',
        'Amount must be in valid currency format',
        (amount) => /\$?[0-9][0-9.,]*/.test(amount as unknown as string),
      )
      .test(
        'Is positive?',
        'Must use a positive number for amount',
        (value) => parseFloat(value as unknown as string) > 0,
      ),
    appealAmount: yup
      .number()
      .typeError('Appeal amount must be a valid number')
      .nullable()
      .test(
        'Is appeal amount in valid currency format?',
        'Appeal amount must be in valid currency format',
        (amount) =>
          !amount || /\$?[0-9][0-9.,]*/.test(amount as unknown as string),
      )
      .test(
        'Is positive?',
        'Must use a positive number for appeal amount',
        (value) => !value || parseFloat(value as unknown as string) > 0,
      ),
    appealId: yup.string().nullable(),
    currency: yup.string().required(),
    designationAccountId: yup.string().required(),
    donationDate: yup.string().required(),
    donorAccountId: yup.string().required(),
    memo: yup.string().nullable(),
    motivation: yup.string().nullable(),
    paymentMethod: yup.string().nullable(),
  });

const LogFormLabel = styled(FormLabel)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  '& span': {
    color: theme.palette.error.main,
  },
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

export const AddDonation = ({
  accountListId,
  handleClose,
}: AddDonationProps): ReactElement<AddDonationProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const constants = useApiConstants();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const { data, loading } = useGetDonationModalQuery({
    variables: {
      accountListId,
    },
  });

  const [addDonation, { loading: adding }] = useAddDonationMutation({
    refetchQueries: [
      'ContactDonationsList',
      'GetContactDonations',
      'GetDonationsTable',
    ],
  });

  const pledgeCurrencies = constants?.pledgeCurrencies;

  const initialDonation: Omit<DonationCreateInput, 'id'> = {
    amount: 0,
    appealAmount: null,
    appealId: null,
    currency: data?.accountList.currency ?? '',
    designationAccountId: '',
    donationDate: DateTime.local().startOf('hour').toISO(),
    donorAccountId: '',
    memo: null,
    motivation: null,
    paymentMethod: null,
  };

  const onSubmit = async (attributes: Omit<DonationCreateInput, 'id'>) => {
    const amount = (attributes.amount as unknown as string).replace(
      /[^\d.-]/g,
      '',
    );

    const { data } = await addDonation({
      variables: {
        accountListId,
        attributes: {
          ...attributes,
          amount: parseFloat(amount),
          appealAmount: parseFloat(
            attributes.appealAmount as unknown as string,
          ),
        },
      },
    });
    if (data?.createDonation?.donation.id) {
      enqueueSnackbar(t('Donation successfully added'), {
        variant: 'success',
      });
    }
    handleClose();
  };

  if (loading) {
    return (
      <DialogContent dividers>
        <Box width="100%" display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </DialogContent>
    );
  }

  return (
    <Formik
      initialValues={initialDonation}
      validationSchema={donationSchema}
      onSubmit={onSubmit}
      validateOnMount
    >
      {({
        values: { appealId },
        setFieldValue,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <Form>
          <DialogContent dividers>
            <Grid container spacing={1}>
              {/* Amount and Currency Row */}
              <Grid container item xs={12} spacing={1}>
                <Grid item xs={isMobile ? 12 : 8}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.amount && touched.amount}
                  >
                    <LogFormLabel
                      htmlFor="amount-input"
                      id="amount-input-label"
                      required
                    >
                      {t('Amount')}
                    </LogFormLabel>
                    <FastField name="amount">
                      {({ field, meta }: FieldProps) => (
                        <Box width="100%">
                          <FormTextField
                            {...field}
                            size="small"
                            variant="outlined"
                            fullWidth
                            type="text"
                            inputProps={{
                              'aria-labelledby': 'amount-input-label',
                            }}
                            id="amount-input"
                            error={!!errors.amount && touched.amount}
                          />
                          <FormHelperText>
                            {meta.touched && meta.error}
                          </FormHelperText>
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.currency && touched.currency}
                  >
                    <LogFormLabel
                      htmlFor="currency-select"
                      required
                      id="currency-select-label"
                    >
                      {t('Currency')}
                    </LogFormLabel>
                    {pledgeCurrencies && (
                      <FastField name="currency">
                        {({ field }: FieldProps) => (
                          <Box width="100%">
                            <Select
                              {...field}
                              fullWidth
                              id="currency-select"
                              variant="outlined"
                              labelId="currency-select-label"
                              inputProps={{
                                'aria-labelledby': 'currency-select-label',
                              }}
                              value={field.value}
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
                          </Box>
                        )}
                      </FastField>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              {/* Donation Date and Motivation Row */}
              <Grid container item xs={12} spacing={1}>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.donationDate && touched.donationDate}
                  >
                    <LogFormLabel htmlFor="date-input" id="date-label" required>
                      {t('Date')}
                    </LogFormLabel>
                    <FastField name="donationDate">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <MobileDatePicker
                            renderInput={(params) => (
                              <TextField
                                id="date-input"
                                fullWidth
                                size="small"
                                inputProps={{
                                  'aria-labelledby': 'date-label',
                                }}
                                {...params}
                              />
                            )}
                            {...field}
                            onChange={(date) =>
                              !date ? null : setFieldValue('donationDate', date)
                            }
                            value={
                              field.value ? DateTime.fromISO(field.value) : null
                            }
                            inputFormat={getDateFormatPattern()}
                          />
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    disabled
                    error={!!errors.motivation && touched.motivation}
                  >
                    <LogFormLabel
                      htmlFor="motivation-input"
                      id="motivation-label"
                    >
                      {t('Motivation')}
                    </LogFormLabel>
                    <Field name="motivation">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <FormTextField
                            {...field}
                            size="small"
                            id="motivation-input"
                            variant="outlined"
                            fullWidth
                            type="text"
                            disabled
                            inputProps={{
                              'aria-labelledby': 'motivation-label',
                            }}
                          />
                        </Box>
                      )}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
              {/* Partner and Designation Account Row */}
              <Grid container item xs={12} spacing={1}>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.donorAccountId && touched.donorAccountId}
                  >
                    <LogFormLabel
                      htmlFor="partner-account-input"
                      id="partner-account-label"
                      required
                    >
                      {t('Partner Account')}
                    </LogFormLabel>
                    <Field name="donorAccountId">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <DonorAccountAutocomplete
                            accountListId={accountListId}
                            onChange={(donorAccountId) =>
                              setFieldValue('donorAccountId', donorAccountId)
                            }
                            value={field.value}
                            autocompleteId="partner-account-input"
                            labelId="partner-account-label"
                            size="small"
                          />
                        </Box>
                      )}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={
                      !!errors.designationAccountId &&
                      touched.designationAccountId
                    }
                  >
                    <LogFormLabel
                      htmlFor="designation-account-input"
                      id="designation-account-label"
                      required
                    >
                      {t('Designation Account')}
                    </LogFormLabel>
                    <FastField name="designationAccountId">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <Autocomplete
                            {...field}
                            id="designation-account-input"
                            loading={loading}
                            autoHighlight
                            options={
                              (data?.designationAccounts &&
                                data?.designationAccounts[0]?.designationAccounts.map(
                                  ({ id }) => id,
                                )) ??
                              []
                            }
                            getOptionLabel={(accountId): string => {
                              const account =
                                data?.designationAccounts &&
                                data?.designationAccounts[0]?.designationAccounts.find(
                                  ({ id }) => id === accountId,
                                );
                              return account
                                ? `${account?.name} (${account.id}) `
                                : '';
                            }}
                            renderInput={(params): ReactElement => (
                              <TextField
                                {...params}
                                size="small"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  'aria-labelledby':
                                    'designation-account-label',
                                  endAdornment: (
                                    <>
                                      {loading && (
                                        <CircularProgress
                                          color="primary"
                                          size={20}
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            value={field.value}
                            onChange={(_, designationAccountId): void =>
                              setFieldValue(
                                'designationAccountId',
                                designationAccountId,
                              )
                            }
                            isOptionEqualToValue={(option, value): boolean =>
                              option === value
                            }
                          />
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
              </Grid>
              {/* Appeal and Appeal Amount Row */}
              <Grid container item xs={12} spacing={1}>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.appealId && touched.appealId}
                  >
                    <LogFormLabel htmlFor="appeal-input" id="appeal-label">
                      {t('Appeal')}
                    </LogFormLabel>
                    <FastField name="appealId">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <Autocomplete
                            {...field}
                            id="appeal-input"
                            loading={loading}
                            autoHighlight
                            options={
                              (data?.accountList.appeals &&
                                data.accountList.appeals.map(({ id }) => id)) ??
                              []
                            }
                            getOptionLabel={(appealId): string => {
                              const appeal =
                                data?.accountList.appeals &&
                                data?.accountList?.appeals.find(
                                  ({ id }) => id === appealId,
                                );
                              return appeal?.name ?? '';
                            }}
                            renderInput={(params): ReactElement => (
                              <TextField
                                {...params}
                                size="small"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  'aria-labelledby': 'appeal-label',
                                  endAdornment: (
                                    <>
                                      {loading && (
                                        <CircularProgress
                                          color="primary"
                                          size={20}
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            value={field.value}
                            onChange={(_, appealId): void =>
                              setFieldValue('appealId', appealId)
                            }
                            isOptionEqualToValue={(option, value): boolean =>
                              option === value
                            }
                          />
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.appealAmount && touched.appealAmount}
                  >
                    <LogFormLabel
                      htmlFor="appeal-amount-input"
                      id="appeal-amount-label"
                    >
                      {t('Appeal Amount')}
                    </LogFormLabel>
                    <Field name="appealAmount">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <FormTextField
                            {...field}
                            id="appeal-amount-input"
                            size="small"
                            variant="outlined"
                            fullWidth
                            type="text"
                            placeholder={t(
                              'Leave empty to use full donation amount',
                            )}
                            disabled={!appealId}
                            error={
                              !!errors.appealAmount && touched.appealAmount
                            }
                            inputProps={{
                              'aria-labelledby': 'appeal-amount-label',
                            }}
                          />
                        </Box>
                      )}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
              {/* Memo Row */}
              <Grid container item xs={12} spacing={1}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <LogFormLabel
                      data-testid="memo-label"
                      htmlFor="memo-input"
                      id="memo-label"
                    >
                      {t('Memo')}
                    </LogFormLabel>
                    <FastField name="memo">
                      {({ field }: FieldProps) => (
                        <Box width="100%">
                          <FormTextField
                            {...field}
                            id="memo-input"
                            size="small"
                            variant="outlined"
                            fullWidth
                            type="text"
                            error={!!errors.memo && touched.memo}
                            inputProps={{
                              'aria-labelledby': 'memo-label',
                            }}
                          />
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <CancelButton
              disabled={isSubmitting || adding}
              onClick={handleClose}
            />
            <SubmitButton disabled={!isValid || isSubmitting || adding}>
              {adding && <CircularProgress size={20} />}
              {t('Save')}
            </SubmitButton>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};
