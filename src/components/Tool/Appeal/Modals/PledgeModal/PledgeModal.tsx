import React, { ReactElement } from 'react';
import {
  Alert,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import { FastField, FieldProps, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { FormTextField } from 'src/components/Shared/styledComponents/FormTextField';
import { LogFormLabel } from 'src/components/Shared/styledComponents/LogStyling';
import { CurrencyAutocomplete } from 'src/components/common/Autocomplete/CurrencyAutocomplete/CurrencyAutocomplete';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import { requiredDateTime } from 'src/lib/formikHelpers';
import i18n from 'src/lib/i18n';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import handleReceivedSnackBarNotifications from '../../Shared/handleReceivedSnackBarNotifications/handleReceivedSnackBarNotifications';
import {
  useCreateAccountListPledgeMutation,
  useUpdateAccountListPledgeMutation,
} from './ContactPledge.generated';

interface PledgeModalProps {
  handleClose: () => void;
  contact: {
    id: string;
    name: string;
  };
  pledge?: AppealContactInfoFragment['pledges'][0];
  selectedAppealStatus?: AppealStatusEnum | null;
}

const CreatePledgeSchema = yup.object({
  amount: yup
    .number()
    .typeError(i18n.t('Amount must be a valid number'))
    .required(i18n.t('Amount is required'))
    .test(
      i18n.t('Is amount in valid currency format?'),
      i18n.t('Amount must be in valid currency format'),
      (amount) => /\$?[0-9][0-9.,]*/.test(amount as unknown as string),
    )
    .test(
      i18n.t('Is positive?'),
      i18n.t('Must use a positive number for amount'),
      (value) => parseFloat(value as unknown as string) > 0,
    ),
  amountCurrency: yup.string().required(i18n.t('Currency is required')),
  expectedDate: requiredDateTime(i18n.t('Expected Date is required')),
  status: yup.string().required(i18n.t('Status is required')),
});

type Attributes = yup.InferType<typeof CreatePledgeSchema>;

export const PledgeModal: React.FC<PledgeModalProps> = ({
  contact,
  pledge,
  handleClose,
  selectedAppealStatus,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [createAccountListPledge] = useCreateAccountListPledgeMutation();
  const [updateAccountListPledge] = useUpdateAccountListPledgeMutation();
  const { accountListId, appealId } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const constants = useApiConstants();
  const pledgeCurrencies = constants?.pledgeCurrency;

  const isNewPledge = pledge === undefined;

  const onSubmit = async (attributes: Attributes) => {
    const amount = parseFloat(
      attributes.amount.toString().replace(/[^\d.-]/g, ''),
    );

    if (isNewPledge) {
      await createAccountListPledge({
        variables: {
          input: {
            accountListId: accountListId ?? '',
            attributes: {
              appealId: appealId,
              contactId: contact.id,
              amount: amount,
              amountCurrency: attributes.amountCurrency,
              expectedDate: attributes.expectedDate.toISODate() ?? '',
              status: attributes.status as PledgeStatusEnum,
            },
          },
        },
        refetchQueries: ['Contacts', 'Appeal'],
        onCompleted: ({ createAccountListPledge }) => {
          const newStatus = createAccountListPledge?.pledge.status;
          if (selectedAppealStatus) {
            handleReceivedSnackBarNotifications({
              dbStatus: newStatus,
              selectedAppealStatus,
              t,
              enqueueSnackbar,
            });
          }

          enqueueSnackbar(t('Successfully added commitment to appeal'), {
            variant: 'success',
          });
          handleClose();
        },
        onError: () => {
          enqueueSnackbar(t('Unable to add commitment to appeal'), {
            variant: 'error',
          });
        },
      });
    } else {
      await updateAccountListPledge({
        variables: {
          input: {
            pledgeId: pledge.id ?? '',
            attributes: {
              id: pledge.id,
              appealId: appealId ?? '',
              contactId: contact.id,
              amount: amount,
              amountCurrency: attributes.amountCurrency,
              expectedDate: attributes.expectedDate.toISODate() ?? '',
              status: attributes.status as PledgeStatusEnum,
            },
          },
        },
        refetchQueries: ['Contacts', 'Appeal'],
        onCompleted: ({ updateAccountListPledge }) => {
          const newStatus = updateAccountListPledge?.pledge.status;

          if (selectedAppealStatus) {
            handleReceivedSnackBarNotifications({
              dbStatus: newStatus,
              selectedAppealStatus,
              t,
              enqueueSnackbar,
            });
          }

          enqueueSnackbar(t('Successfully edited commitment'), {
            variant: 'success',
          });
          handleClose();
        },
        onError: () => {
          enqueueSnackbar(t('Unable to edit commitment'), {
            variant: 'error',
          });
        },
      });
    }
  };

  const initialValues = pledge
    ? {
        amount: pledge.amount,
        amountCurrency: pledge.amountCurrency ?? 'USD',
        expectedDate: DateTime.fromISO(pledge.expectedDate),
        status: pledge.status ?? PledgeStatusEnum.NotReceived,
      }
    : {
        amount: 0,
        amountCurrency: 'USD',
        expectedDate: DateTime.local().startOf('day'),
        status: PledgeStatusEnum.NotReceived,
      };

  return (
    <Modal
      title={isNewPledge ? t('Add Commitment') : t('Edit Commitment')}
      isOpen={true}
      handleClose={handleClose}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={CreatePledgeSchema}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          values: { status, amountCurrency },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
          touched,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid item>
                <Alert severity="info" sx={{ marginBottom: 1 }}>
                  <Typography>
                    {isNewPledge
                      ? t('You are adding a commitment for')
                      : t('You are editing the commitment for')}
                    <b> {contact.name}</b>
                  </Typography>
                </Alert>
              </Grid>

              {/* Amount and Currency Row */}
              <Grid container item xs={12} spacing={isMobile ? 1 : 0}>
                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={isMobile ? 12 : 6}>
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
                              disabled={
                                pledge?.status === PledgeStatusEnum.Processed
                              }
                              type="text"
                              inputProps={{
                                'aria-labelledby': 'amount-input-label',
                              }}
                              id="amount-input"
                              error={!!errors.amount && touched.amount}
                              // eslint-disable-next-line jsx-a11y/no-autofocus
                              autoFocus
                            />
                            <FormHelperText>
                              {meta.touched && meta.error}
                            </FormHelperText>
                          </Box>
                        )}
                      </FastField>
                    </FormControl>
                  </Grid>
                  <Grid item xs={isMobile ? 12 : 6}>
                    <FormControl
                      size="small"
                      fullWidth
                      error={!!errors.amountCurrency && touched.amountCurrency}
                    >
                      <LogFormLabel
                        htmlFor="amountCurrency-select"
                        required
                        id="amountCurrency-select-label"
                      >
                        {t('Currency')}
                      </LogFormLabel>
                      {pledgeCurrencies && (
                        <CurrencyAutocomplete
                          disabled={isSubmitting}
                          id="amountCurrency-select"
                          value={amountCurrency}
                          onChange={(_, currencyCode) => {
                            setFieldValue('amountCurrency', currencyCode);
                          }}
                          textFieldProps={{
                            error: !!errors.amountCurrency,
                          }}
                          size="small"
                        />
                      )}
                      {errors.amountCurrency && (
                        <FormHelperText error={true}>
                          {t('This field is required')}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={isMobile ? 12 : 6}>
                    <FormControl
                      size="small"
                      fullWidth
                      error={Boolean(
                        errors.expectedDate && touched.expectedDate,
                      )}
                    >
                      <LogFormLabel
                        htmlFor="date-input"
                        id="date-label"
                        required
                      >
                        {t('Expected Date')}
                      </LogFormLabel>
                      <FastField name="expectedDate">
                        {({ field }: FieldProps) => (
                          <CustomDateField
                            id="date-input"
                            size="small"
                            inputProps={{
                              'aria-labelledby': 'date-label',
                            }}
                            {...field}
                            onChange={(date) =>
                              setFieldValue('expectedDate', date)
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
                      error={!!errors.status && touched.status}
                    >
                      <LogFormLabel
                        htmlFor="status-select"
                        required
                        id="status-select-label"
                      >
                        {t('Status')}
                      </LogFormLabel>
                      <FastField name="status">
                        {({ field }: FieldProps) => (
                          <Box width="100%">
                            <Select
                              {...field}
                              fullWidth
                              id="status-select"
                              variant="outlined"
                              disabled={
                                pledge?.status === PledgeStatusEnum.Processed
                              }
                              labelId="status-select-label"
                              inputProps={{
                                'aria-labelledby': 'status-select-label',
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
                              error={!!errors.status && touched.status}
                            >
                              <MenuItem value={PledgeStatusEnum.NotReceived}>
                                {t('Committed')}
                              </MenuItem>
                              <MenuItem
                                value={PledgeStatusEnum.ReceivedNotProcessed}
                              >
                                {t('Received')}
                              </MenuItem>
                              {pledge?.status ===
                                PledgeStatusEnum.Processed && (
                                <MenuItem value={PledgeStatusEnum.Processed}>
                                  {t('Given')}
                                </MenuItem>
                              )}
                            </Select>
                          </Box>
                        )}
                      </FastField>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              {status === PledgeStatusEnum.ReceivedNotProcessed &&
                initialValues.status !== status && (
                  <Alert
                    severity="warning"
                    sx={{ marginTop: 2 }}
                    data-testid="received-warnings"
                  >
                    <Typography>
                      {t(
                        'Do not move a contact into this column called "Received". Due to an outdated feature, contacts must first be moved to "Committed". If the gift has been recorded, you can then move the contact into the column called "Given".',
                      )}
                    </Typography>

                    <Typography>
                      {t(
                        'In a few cases, the contact may automatically move backward from "Given" to "Received" if the processing is not complete. This behavior is due to the current system design, which we plan to update, but the work will take time and needs to be scheduled.',
                      )}
                    </Typography>
                  </Alert>
                )}
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />

              <SubmitButton disabled={!isValid || isSubmitting}>
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
