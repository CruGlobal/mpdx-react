import React, { ReactElement } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { FastField, Field, FieldProps, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { DonorAccountAutocomplete } from 'src/components/common/DonorAccountAutocomplete/DonorAccountAutocomplete';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { requiredDateTime } from 'src/lib/formikHelpers';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import { useApiConstants } from '../../../../../../../Constants/UseApiConstants';
import {
  useAddDonationMutation,
  useGetDonationModalQuery,
} from './AddDonation.generated';
import { FormTextField, LogFormLabel } from './StyledComponents';

interface AddDonationProps {
  accountListId: string;
  handleClose: () => void;
}

const donationSchema = yup.object({
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
  donationDate: requiredDateTime(),
  donorAccountId: yup.string().required(),
  memo: yup.string().nullable(),
  motivation: yup.string().nullable(),
  paymentMethod: yup.string().nullable(),
});

type Attributes = yup.InferType<typeof donationSchema>;

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

  const { data: accountListData, loading: accountListLoading } =
    useGetDonationModalQuery({
      variables: {
        accountListId,
      },
    });
  const { data: designationAccountsData, loading: designationAccountsLoading } =
    useGetDesignationAccountsQuery({
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

  const pledgeCurrencies = constants?.pledgeCurrency;

  const designationAccounts =
    designationAccountsData?.designationAccounts?.flatMap(
      ({ designationAccounts }) => designationAccounts,
    );

  const initialDonation = {
    amount: 0,
    appealAmount: null,
    appealId: null,
    currency: accountListData?.accountList.currency ?? '',
    designationAccountId:
      designationAccounts?.length === 1 ? designationAccounts[0].id : '',
    donationDate: DateTime.local().startOf('day'),
    donorAccountId: '',
    memo: null,
    motivation: null,
    paymentMethod: null,
  };

  const onSubmit = async (attributes: Attributes) => {
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
          appealAmount: attributes.appealAmount
            ? parseFloat(attributes.appealAmount as unknown as string)
            : null,
          donationDate: attributes.donationDate.toISODate() ?? '',
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

  if (accountListLoading || designationAccountsLoading) {
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
        handleBlur,
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
                              {getPledgeCurrencyOptions(pledgeCurrencies)}
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
                    error={Boolean(errors.donationDate && touched.donationDate)}
                  >
                    <LogFormLabel htmlFor="date-input" id="date-label" required>
                      {t('Date')}
                    </LogFormLabel>
                    <FastField name="donationDate">
                      {({ field }: FieldProps) => (
                        <CustomDateField
                          id="date-input"
                          size="small"
                          inputProps={{
                            'aria-labelledby': 'date-label',
                          }}
                          {...field}
                          onChange={(date) =>
                            setFieldValue('donationDate', date)
                          }
                        />
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
                            onBlur={handleBlur('donorAccountId')}
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
                            loading={designationAccountsLoading}
                            autoSelect
                            autoHighlight
                            options={
                              designationAccounts?.map(({ id }) => id) ?? []
                            }
                            getOptionLabel={(accountId): string => {
                              const account = designationAccounts?.find(
                                ({ id }) => id === accountId,
                              );
                              return account
                                ? `${account?.name} (${account.id})`
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
                                      {designationAccountsLoading && (
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
                            onChange={(_, designationAccountId) =>
                              setFieldValue(
                                'designationAccountId',
                                designationAccountId,
                              )
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
                            loading={accountListLoading}
                            autoSelect
                            autoHighlight
                            options={
                              accountListData?.accountList?.appeals?.map(
                                ({ id }) => id,
                              ) ?? []
                            }
                            getOptionLabel={(appealId) =>
                              accountListData?.accountList?.appeals?.find(
                                ({ id }) => id === appealId,
                              )?.name ?? ''
                            }
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
                                      {accountListLoading && (
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
