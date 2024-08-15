import React, { ReactElement } from 'react';
import {
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Theme,
} from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import { FastField, FieldProps, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  FormTextField,
  LogFormLabel,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/AddDonation';
import { ContactsAutocomplete } from 'src/components/Task/Modal/Form/Inputs/ContactsAutocomplete/ContactsAutocomplete';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import { requiredDateTime } from 'src/lib/formikHelpers';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import i18n from 'src/lib/i18n';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { PledgeInfo } from '../../List/ContactRow/ContactRow';
import { useCreateAccountListPledgeMutation } from './ContactPledge.generated';

export type CreatePledgeFormikSchema = {
  contactId: string;
  amount: number;
  currency: string;
  expectedDate: DateTime<true | false>;
  status: string;
};

export enum PledgeModalEnum {
  Create = 'Create',
  Edit = 'Edit',
}

interface PledgeModalProps {
  handleClose: () => void;
  contact: AppealContactInfoFragment;
  type?: PledgeModalEnum;
  pledge?: PledgeInfo;
}

const CreatePledgeSchema = yup.object({
  contactId: yup.string().required(),
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
  currency: yup.string().required(i18n.t('Currency is required')),
  expectedDate: requiredDateTime(i18n.t('Expected Date is required')),
  status: yup.string().required(i18n.t('Status is required')),
});

type Attributes = yup.InferType<typeof CreatePledgeSchema>;

export const PledgeModal: React.FC<PledgeModalProps> = ({
  contact,
  type = PledgeModalEnum.Create,
  pledge,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [createAccountListPledge] = useCreateAccountListPledgeMutation();
  const { accountListId, appealId, contactsQueryResult } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const constants = useApiConstants();
  const pledgeCurrencies = constants?.pledgeCurrency;

  const onSubmit = async (attributes: Attributes) => {
    const amount = parseFloat(
      (attributes.amount as unknown as string).replace(/[^\d.-]/g, ''),
    );

    await createAccountListPledge({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            appealId: appealId,
            contactId: contact.id,
            amount: amount,
            amountCurrency: attributes.currency,
            expectedDate: attributes.expectedDate.toISODate() ?? '',
            status: attributes.status as PledgeStatusEnum,
          },
        },
      },
      update: () => {
        contactsQueryResult.refetch();
      },
      onCompleted: () => {
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
  };

  const initialValues = pledge
    ? {
        contactId: contact.id,
        amount: pledge.amount,
        currency: pledge.currency,
        expectedDate: DateTime.fromISO(pledge.expectedDate),
        status: pledge.status,
      }
    : {
        contactId: contact.id,
        amount: 0,
        currency: 'USD',
        expectedDate: DateTime.local().startOf('day'),
        status: PledgeStatusEnum.NotReceived,
      };

  return (
    <Modal
      title={
        type === PledgeModalEnum.Create
          ? t('Add Commitment')
          : t('Edit Commitment')
      }
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
          values: { contactId },
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
                <ContactsAutocomplete
                  accountListId={accountListId ?? ''}
                  value={[contactId]}
                  onChange={(contactId) => {
                    setFieldValue('contactId', contactId);
                  }}
                  disabled={true}
                />
              </Grid>

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
                              error={!!errors.currency && touched.currency}
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

              <Grid container item xs={12} spacing={1}>
                <Grid item xs={isMobile ? 12 : 6}>
                  <FormControl
                    size="small"
                    fullWidth
                    error={Boolean(errors.expectedDate && touched.expectedDate)}
                  >
                    <LogFormLabel htmlFor="date-input" id="date-label" required>
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
                            <MenuItem value={''} disabled></MenuItem>
                            <MenuItem value={PledgeStatusEnum.NotReceived}>
                              Committed
                            </MenuItem>
                            <MenuItem
                              value={PledgeStatusEnum.ReceivedNotProcessed}
                            >
                              Received
                            </MenuItem>
                          </Select>
                        </Box>
                      )}
                    </FastField>
                  </FormControl>
                </Grid>
              </Grid>
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
