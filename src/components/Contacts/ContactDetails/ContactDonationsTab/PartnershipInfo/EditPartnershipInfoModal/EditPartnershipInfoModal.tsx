import React, { useMemo, useState } from 'react';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListSubheader,
  MenuItem,
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
import { PledgeFrequencySelect } from 'src/common/Selects/PledgeFrequencySelect';
import { CurrencyAutocomplete } from 'src/components/common/Autocomplete/CurrencyAutocomplete/CurrencyAutocomplete';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { LikelyToGiveSelect } from 'src/components/common/LikelyToGiveSelect/LikelyToGiveSelect';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { NewsletterSelect } from 'src/components/common/NewsletterSelect/NewsletterSelect';
import {
  LikelyToGiveEnum,
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { nullableDateTime } from 'src/lib/formikHelpers';
import {
  amountFormat,
  parseNumberFromCurrencyString,
} from 'src/lib/intlFormat';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import Modal from '../../../../../common/Modal/Modal';
import { ContactDonorAccountsFragment } from '../../ContactDonationsTab.generated';
import { isApartOfSwitzerlandOrganization } from '../PartnershipInfo';
import { useUserOrganizationAccountsQuery } from '../PartnershipInfo.generated';
import { useUpdateContactPartnershipMutation } from './EditPartnershipInfoModal.generated';

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(2, 0),
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const CheckboxLabel = styled(FormControlLabel)({
  margin: 'none',
});

const TextFieldInteractive = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  '& input.MuiInputBase-input, & fieldset': {
    opacity: isDisabled ? '0.4' : '1',
  },
}));

const RemoveCommitmentActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
  gap: theme.spacing(1),
}));

const PledgeFrequencySelectInteractive = styled(PledgeFrequencySelect, {
  shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  '& MuiSelect-select, & fieldset': {
    opacity: isDisabled ? '0.4' : '1',
  },
}));

const contactPartnershipSchema = yup.object({
  id: yup.string().required(),
  status: yup.mixed<StatusEnum>().oneOf(Object.values(StatusEnum)).nullable(),
  pledgeAmount: yup.string().nullable(),
  pledgeStartDate: nullableDateTime(),
  pledgeReceived: yup.boolean().default(false).nullable(),
  pledgeCurrency: yup.string().nullable(),
  nextAsk: nullableDateTime(),
  noAppeals: yup.boolean().default(false).nullable(),
  name: yup.string().required(),
  primaryPersonId: yup.string(),
  sendNewsletter: yup
    .mixed<SendNewsletterEnum>()
    .oneOf(Object.values(SendNewsletterEnum))
    .nullable(),
  pledgeFrequency: yup.mixed<PledgeFrequencyEnum>().nullable(),
  likelyToGive: yup.mixed<LikelyToGiveEnum>().nullable(),
  relationshipCode: yup.string().nullable(),
});

type Attributes = yup.InferType<typeof contactPartnershipSchema>;

interface EditPartnershipInfoModalProps {
  contact: ContactDonorAccountsFragment;
  handleClose: () => void;
}

export const EditPartnershipInfoModal: React.FC<
  EditPartnershipInfoModalProps
> = ({ contact, handleClose }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const constants = useApiConstants();
  const { enqueueSnackbar } = useSnackbar();
  const { getLocalizedContactStatus } = useLocalizedConstants();

  const phases = constants?.phases;
  const [showRemoveCommitmentWarning, setShowRemoveCommitmentWarning] =
    useState(false);

  const { data } = useUserOrganizationAccountsQuery();
  const userOrganizationAccounts = data?.userOrganizationAccounts;

  const showRelationshipCode = useMemo(
    () => isApartOfSwitzerlandOrganization(userOrganizationAccounts),
    [userOrganizationAccounts],
  );

  const [updateContactPartnership, { loading: updating }] =
    useUpdateContactPartnershipMutation();

  const onSubmit = async (attributes: Attributes) => {
    // When the pledgeAmount field is blank, the value will be an empty string, even though TypeScript says the type is `number | null | undefined`
    const pledgeAmountNumber =
      attributes.pledgeAmount?.trim() === ''
        ? null
        : parseNumberFromCurrencyString(attributes.pledgeAmount, locale);

    await updateContactPartnership({
      variables: {
        accountListId: accountListId ?? '',
        attributes: {
          ...attributes,
          pledgeStartDate: attributes.pledgeStartDate?.toISODate() ?? null,
          nextAsk: attributes.nextAsk?.toISODate() ?? null,
          primaryPersonId: attributes.primaryPersonId,
          pledgeAmount: pledgeAmountNumber,
        },
      },
    });

    enqueueSnackbar(t('Partnership information updated successfully.'), {
      variant: 'success',
    });
    handleClose();
  };

  const updateStatus = (
    newStatus: StatusEnum,
    setFieldValue: (name: string, value: StatusEnum | number | null) => void,
    oldStatus?: StatusEnum | null,
    pledgeAmount?: string | null,
    pledgeFrequency?: PledgeFrequencyEnum | null,
  ) => {
    setFieldValue('status', newStatus);
    const normalizedPledgeAmount = parseNumberFromCurrencyString(
      pledgeAmount,
      locale,
    );
    if (
      (newStatus !== StatusEnum.PartnerFinancial &&
        oldStatus === StatusEnum.PartnerFinancial &&
        normalizedPledgeAmount &&
        normalizedPledgeAmount > 0) ||
      pledgeFrequency
    ) {
      setShowRemoveCommitmentWarning(true);
    }
  };

  const removeCommittedDetails = (
    setFieldValue: (
      name: string,
      value: StatusEnum | string | number | null,
    ) => void,
  ) => {
    setFieldValue('pledgeAmount', '');
    setFieldValue('pledgeFrequency', null);
    setShowRemoveCommitmentWarning(false);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit Partnership')}
      handleClose={handleClose}
    >
      <Formik<Attributes>
        initialValues={{
          id: contact.id,
          status: contact.status,
          pledgeAmount: amountFormat(contact.pledgeAmount, locale) ?? '',
          pledgeFrequency: contact.pledgeFrequency,
          pledgeReceived: contact.pledgeReceived,
          pledgeCurrency: contact.pledgeCurrency,
          pledgeStartDate: contact.pledgeStartDate
            ? DateTime.fromISO(contact.pledgeStartDate)
            : null,
          nextAsk: contact.nextAsk ? DateTime.fromISO(contact.nextAsk) : null,
          noAppeals: Boolean(contact.noAppeals),
          sendNewsletter: contact.sendNewsletter ?? SendNewsletterEnum.None,
          likelyToGive: contact.likelyToGive,
          name: contact.name,
          primaryPersonId: contact?.primaryPerson?.id ?? '',
          relationshipCode: contact.relationshipCode ?? '',
        }}
        validationSchema={contactPartnershipSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            status,
            pledgeAmount,
            pledgeFrequency,
            pledgeCurrency,
            pledgeReceived,
            pledgeStartDate,
            nextAsk,
            noAppeals,
            sendNewsletter,
            likelyToGive,
            name,
            primaryPersonId,
            relationshipCode,
          },
          handleSubmit,
          handleChange,
          setFieldValue,
          isSubmitting,
          isValid,
          touched,
          errors,
          handleBlur,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            {errors.pledgeFrequency}
            <DialogContent dividers sx={{ maxHeight: '60vh' }}>
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <TextField
                      name="name"
                      label={t('Contact Name')}
                      value={name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputProps={{ 'aria-label': t('Contact') }}
                      error={!!errors.name && touched.name}
                      helperText={
                        errors.name &&
                        touched.name &&
                        t('Contact name is required')
                      }
                      fullWidth
                    />
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth={true}>
                      <InputLabel id="primary-person-select-label">
                        {t('Primary Person')}
                      </InputLabel>
                      <Select
                        label={t('Primary Person')}
                        labelId="primary-person-select-label"
                        value={primaryPersonId}
                        onChange={(e) =>
                          setFieldValue('primaryPersonId', e.target.value)
                        }
                        fullWidth={true}
                      >
                        {contact.people.nodes.map((person) => (
                          <MenuItem key={person.id} value={person.id}>{`${
                            person.firstName || ''
                          } ${person.lastName || ''}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth>
                      <InputLabel id="status-select-label">
                        {t('Status')}
                      </InputLabel>
                      <Select
                        label={t('Status')}
                        labelId="status-select-label"
                        value={status}
                        onChange={(e) =>
                          updateStatus(
                            e.target.value as StatusEnum,
                            setFieldValue,
                            status,
                            pledgeAmount,
                            pledgeFrequency,
                          )
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
                        {phases?.map((phase) => [
                          <ListSubheader key={phase?.id}>
                            {phase?.name}
                          </ListSubheader>,
                          phase?.contactStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              {getLocalizedContactStatus(status)}
                            </MenuItem>
                          )),
                        ])}
                      </Select>
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth>
                      <InputLabel id="newsletter-select-label">
                        {t('Newsletter')}
                      </InputLabel>
                      <NewsletterSelect
                        label={t('Newsletter')}
                        labelId="newsletter-select-label"
                        value={sendNewsletter}
                        onChange={(e) =>
                          setFieldValue(
                            'sendNewsletter',
                            e.target.value as SendNewsletterEnum,
                          )
                        }
                      />
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                {showRemoveCommitmentWarning && (
                  <ContactInputWrapper data-testid="removeCommitmentMessage">
                    <Alert severity="warning">
                      <Typography>
                        {t(
                          '{{appName}} uses your contact status, commitment amount, and frequency together to calculate many things, including your progress towards your goal and notification alerts.',
                          { appName },
                        )}
                      </Typography>
                      <Typography my={'10px'}>
                        {t(
                          'If you are switching this contact away from Partner - Financial status, their commitment amount and frequency will no longer be included in calculations. Would you like to remove their commitment amount and frequency, as well?',
                        )}
                      </Typography>
                      <RemoveCommitmentActions>
                        <Button
                          color="inherit"
                          size="small"
                          variant="contained"
                          onClick={() => setShowRemoveCommitmentWarning(false)}
                        >
                          {t('No')}
                        </Button>
                        <Button
                          color="primary"
                          size="small"
                          variant="contained"
                          onClick={() => removeCommittedDetails(setFieldValue)}
                        >
                          {t('Yes')}
                        </Button>
                      </RemoveCommitmentActions>
                    </Alert>
                  </ContactInputWrapper>
                )}
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <TextFieldInteractive
                      label={t('Amount')}
                      isDisabled={status !== StatusEnum.PartnerFinancial}
                      value={pledgeAmount}
                      type="text"
                      disabled={status !== StatusEnum.PartnerFinancial}
                      aria-readonly={status !== StatusEnum.PartnerFinancial}
                      onChange={(e) => {
                        setFieldValue('pledgeAmount', e.target.value);
                      }}
                      onBlur={() => {
                        const normalizedPledgeAmount =
                          parseNumberFromCurrencyString(pledgeAmount, locale);
                        setFieldValue(
                          'pledgeAmount',
                          amountFormat(normalizedPledgeAmount, locale),
                        );
                      }}
                      inputProps={{ 'aria-label': t('Amount') }}
                      InputProps={{
                        endAdornment: (
                          <Tooltip
                            title={
                              <Typography>
                                {t(
                                  'Commitments can only be set if status is Partner - Financial',
                                )}
                              </Typography>
                            }
                          >
                            <InfoIcon />
                          </Tooltip>
                        ),
                      }}
                      fullWidth
                    />
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth>
                      <InputLabel id="frequency-select-label">
                        {t('Frequency')}
                      </InputLabel>
                      <PledgeFrequencySelectInteractive
                        label={t('Frequency')}
                        labelId="frequency-select-label"
                        value={pledgeFrequency ?? ''}
                        isDisabled={status !== StatusEnum.PartnerFinancial}
                        disabled={status !== StatusEnum.PartnerFinancial}
                        aria-readonly={status !== StatusEnum.PartnerFinancial}
                        onChange={(e) =>
                          setFieldValue('pledgeFrequency', e.target.value)
                        }
                        IconComponent={
                          status !== StatusEnum.PartnerFinancial
                            ? () => (
                                <Tooltip
                                  sx={{ marginRight: '14px' }}
                                  title={
                                    <Typography>
                                      {t(
                                        'Commitments can only be set if status is Partner - Financial',
                                      )}
                                    </Typography>
                                  }
                                >
                                  <InfoIcon />
                                </Tooltip>
                              )
                            : undefined
                        }
                      >
                        <MenuItem value={''} disabled></MenuItem>
                      </PledgeFrequencySelectInteractive>
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth>
                      <CurrencyAutocomplete
                        disabled={isSubmitting}
                        value={pledgeCurrency}
                        onChange={(_, currencyCode) => {
                          setFieldValue('pledgeCurrency', currencyCode);
                        }}
                        textFieldProps={{
                          'aria-label': t('Currency'),
                          label: t('Currency'),
                          placeholder: t('Currency'),
                        }}
                      />
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <CustomDateField
                      label={t('Start Date')}
                      value={pledgeStartDate}
                      onChange={(date) =>
                        setFieldValue('pledgeStartDate', date)
                      }
                    />
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <FormControl fullWidth>
                      <InputLabel id="likely-to-give-select-label">
                        {t('Likely To Give')}
                      </InputLabel>
                      <LikelyToGiveSelect
                        label={t('Likely To Give')}
                        labelId="likely-to-give-select-label"
                        value={likelyToGive ?? ''}
                        onChange={(e) =>
                          setFieldValue(
                            'likelyToGive',
                            e.target.value as LikelyToGiveEnum,
                          )
                        }
                      />
                    </FormControl>
                  </ContactInputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ContactInputWrapper>
                    <CustomDateField
                      label={t('Next Increase Ask')}
                      value={nextAsk}
                      onChange={(nextAsk) => setFieldValue('nextAsk', nextAsk)}
                    />
                  </ContactInputWrapper>
                </Grid>
                {showRelationshipCode && (
                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <TextField
                        name="relationshipCode"
                        label={t('Relationship Code')}
                        value={relationshipCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputProps={{ 'aria-label': t('Relationship Code') }}
                        fullWidth
                      />
                    </ContactInputWrapper>
                  </Grid>
                )}
              </Grid>

              <ContactInputWrapper>
                <CheckboxLabel
                  control={
                    <Checkbox
                      checked={Boolean(pledgeReceived)}
                      onChange={() =>
                        setFieldValue('pledgeReceived', !pledgeReceived)
                      }
                      color="secondary"
                    />
                  }
                  label={t('Commitment Received')}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CheckboxLabel
                  control={
                    <Checkbox
                      checked={!noAppeals}
                      onChange={() => setFieldValue('noAppeals', !noAppeals)}
                      color="secondary"
                    />
                  }
                  label={t('Send Appeals')}
                />
              </ContactInputWrapper>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {updating && <LoadingIndicator color="primary" size={20} />}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
