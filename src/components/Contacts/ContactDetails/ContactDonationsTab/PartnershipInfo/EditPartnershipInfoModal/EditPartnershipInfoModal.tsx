import React, { ReactElement, useState } from 'react';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
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
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ContactReferralToMeInput,
  LikelyToGiveEnum,
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import { getLocalizedLikelyToGive } from 'src/utils/functions/getLocalizedLikelyToGive';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import { getLocalizedSendNewsletter } from 'src/utils/functions/getLocalizedSendNewsletter';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import Modal from '../../../../../common/Modal/Modal';
import { ContactDonorAccountsFragment } from '../../ContactDonationsTab.generated';
import {
  useGetDataForPartnershipInfoModalQuery,
  useUpdateContactPartnershipMutation,
} from './EditPartnershipInfoModal.generated';

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
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

const SelectInteractive = styled(Select, {
  shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  '& MuiSelect-select, & fieldset': {
    opacity: isDisabled ? '0.4' : '1',
  },
}));

const contactPartnershipSchema = yup.object({
  id: yup.string().required(),
  status: yup
    .mixed<StatusEnum | null>()
    .oneOf([...Object.values(StatusEnum), null])
    .nullable(),
  pledgeAmount: yup.number().moreThan(-1).nullable(),
  pledgeStartDate: nullableDateTime(),
  pledgeReceived: yup.boolean().default(false).nullable(),
  pledgeCurrency: yup.string().nullable(),
  nextAsk: nullableDateTime(),
  noAppeals: yup.boolean().default(false).nullable(),
  sendNewsletter: yup
    .mixed<SendNewsletterEnum>()
    .oneOf(Object.values(SendNewsletterEnum))
    .nullable(),
  pledgeFrequency: yup.mixed<PledgeFrequencyEnum>().nullable(),
  contactReferralsToMe: yup
    .array()
    .of(
      yup.object({
        destroy: yup.boolean().default(false),
        referredById: yup.string().nullable(),
        id: yup.string().nullable(),
      }),
    )
    .default([]),
  likelyToGive: yup.mixed<LikelyToGiveEnum>().nullable(),
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
  const accountListId = useAccountListId();
  const constants = useApiConstants();
  const { contactPartnershipStatus } = useContactPartnershipStatuses();

  const phases = constants?.phases;
  const [referredByName, setReferredByName] = useState('');
  const referredContactIds = contact.contactReferralsToMe.nodes.map(
    (referral) => referral.referredBy.id,
  );
  const [currentReferredContactIds, setCurrentReferredContactIds] =
    useState(referredContactIds);

  const { enqueueSnackbar } = useSnackbar();
  const { data, loading, refetch } = useGetDataForPartnershipInfoModalQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilter: {
        nameLike: referredByName,
      },
    },
  });

  const [updateContactPartnership, { loading: updating }] =
    useUpdateContactPartnershipMutation();
  const pledgeCurrencies = constants?.pledgeCurrencies;

  const onSubmit = async (attributes: Attributes) => {
    const removedReferrals = contact.contactReferralsToMe.nodes
      .filter(
        (referral) =>
          currentReferredContactIds.indexOf(referral.referredBy.id) === -1,
      )
      .map((referral) => ({
        id: referral.id,
        referredById: referral.referredBy.id,
        destroy: true,
      }));

    await updateContactPartnership({
      variables: {
        accountListId: accountListId ?? '',
        attributes: {
          ...attributes,
          pledgeStartDate: attributes.pledgeStartDate?.toISODate(),
          nextAsk: attributes.nextAsk?.toISODate(),
          contactReferralsToMe: [
            ...(attributes.contactReferralsToMe || []),
            ...removedReferrals,
          ],
        },
      },
    });

    enqueueSnackbar(t('Partnership information updated successfully.'), {
      variant: 'success',
    });
    handleClose();
  };

  const handleUpdateReferredBySearch = (search: string) => {
    setReferredByName(search);
    refetch({
      accountListId,
      contactsFilter: {
        nameLike: referredByName,
      },
    });
  };

  const filteredContacts = data?.contacts.nodes.filter(
    ({ id }) => id !== contact.id,
  );

  const contactReferralData = contact.contactReferralsToMe.nodes.map(
    (referral) => ({
      name: referral.referredBy.name,
      id: referral.referredBy.id,
    }),
  );

  const contactReferrals = contact.contactReferralsToMe.nodes.map(
    (referral) => ({
      destroy: false,
      referredById: referral.referredBy.id,
      id: referral.id,
    }),
  );

  const updateCurrentContacts = (ids: string[]) => {
    // Use the current list of contacts from the data and the current selected ids to determine if there are any new contacts
    const newCurrentContacts =
      data?.contacts.nodes
        .filter(
          (contact) =>
            ids.indexOf(contact.id) !== -1 &&
            currentReferredContactIds.indexOf(contact.id) === -1,
        )
        .map(({ name, id }) => ({ name, id })) || [];

    setCurrentContacts([
      // filter out any current contacts that are no longer selected
      ...currentContacts.filter((contact) => ids.indexOf(contact.id) !== -1),
      ...newCurrentContacts,
    ]);
  };

  // Value used to persist currently selected contact data, even as the user searches for new contacts
  const [currentContacts, setCurrentContacts] = useState(contactReferralData);

  const updateReferredBy = (
    ids: string[],
    setFieldValue: (name: string, value: ContactReferralToMeInput[]) => void,
  ) => {
    // Set the ids currently selected
    setCurrentReferredContactIds(ids);
    // Update array of current contacts based on currently selected ids
    updateCurrentContacts(ids);

    // Map through current referrals and filter out ones that are not currently selected
    const referralsToMe = contact.contactReferralsToMe.nodes
      .filter((referral) => ids.indexOf(referral.referredBy.id) !== -1)
      .map((referral) => {
        return {
          id: referral.id,
          referredById: referral.referredBy.id,
          destroy: false,
        };
      });
    // Map through currently selected ids, and filter out any that are already existing referral contact ids
    const newReferralsToMe = ids
      .filter((referredId) => referredContactIds.indexOf(referredId) === -1)
      .map((referredById) => ({
        destroy: false,
        referredById,
      }));

    setFieldValue('contactReferralsToMe', [
      ...referralsToMe,
      ...newReferralsToMe,
    ]);
  };

  const updateStatus = (
    status: StatusEnum,
    setFieldValue: (name: string, value: StatusEnum | number | null) => void,
  ) => {
    setFieldValue('status', status);
    if (status !== StatusEnum.PartnerFinancial) {
      setFieldValue('pledgeAmount', 0);
      setFieldValue('pledgeFrequency', null);
    }
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
          pledgeAmount: contact.pledgeAmount,
          pledgeFrequency: contact.pledgeFrequency,
          pledgeReceived: contact.pledgeReceived,
          pledgeCurrency: contact.pledgeCurrency,
          pledgeStartDate: contact.pledgeStartDate
            ? DateTime.fromISO(contact.pledgeStartDate)
            : null,
          nextAsk: contact.nextAsk ? DateTime.fromISO(contact.nextAsk) : null,
          noAppeals: Boolean(contact.noAppeals),
          sendNewsletter: contact.sendNewsletter ?? SendNewsletterEnum.None,
          contactReferralsToMe: contactReferrals,
          likelyToGive: contact.likelyToGive,
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
            contactReferralsToMe,
            likelyToGive,
          },
          handleSubmit,
          handleChange,
          setFieldValue,
          isSubmitting,
          isValid,
          errors,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            {errors.pledgeFrequency}
            <DialogContent dividers sx={{ maxHeight: '60vh' }}>
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
                      updateStatus(e.target.value as StatusEnum, setFieldValue)
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
                      <ListSubheader key={phase?.name}>
                        {phase?.name}
                      </ListSubheader>,
                      phase?.contactStatuses.map((s: StatusEnum) => (
                        <MenuItem key={s} value={s}>
                          {contactPartnershipStatus[s]?.translated}
                        </MenuItem>
                      )),
                    ])}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <TextFieldInteractive
                  label={t('Amount')}
                  isDisabled={status !== StatusEnum.PartnerFinancial}
                  value={pledgeAmount}
                  type="number"
                  disabled={status !== StatusEnum.PartnerFinancial}
                  aria-readonly={status !== StatusEnum.PartnerFinancial}
                  onChange={handleChange('pledgeAmount')}
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
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="currency-select-label">
                    {t('Currency')}
                  </InputLabel>
                  {pledgeCurrencies && (
                    <Select
                      label={t('Currency')}
                      labelId="currency-select-label"
                      value={pledgeCurrency ?? ''}
                      onChange={(e) =>
                        setFieldValue('pledgeCurrency', e.target.value)
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
                  )}
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="likely-to-give-select-label">
                    {t('Likely To Give')}
                  </InputLabel>
                  <Select
                    label={t('Likely To Give')}
                    labelId="likely-to-give-select-label"
                    value={likelyToGive ?? ''}
                    onChange={(e) =>
                      setFieldValue(
                        'likelyToGive',
                        e.target.value as LikelyToGiveEnum,
                      )
                    }
                  >
                    {Object.values(LikelyToGiveEnum).map((val) => (
                      <MenuItem key={val} value={val}>
                        {getLocalizedLikelyToGive(t, val)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="frequency-select-label">
                    {t('Frequency')}
                  </InputLabel>
                  <SelectInteractive
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
                    {Object.values(PledgeFrequencyEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {getLocalizedPledgeFrequency(t, value)}
                      </MenuItem>
                    ))}
                  </SelectInteractive>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CustomDateField
                  label={t('Start Date')}
                  value={pledgeStartDate}
                  onChange={(date) => setFieldValue('pledgeStartDate', date)}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="newsletter-select-label">
                    {t('Newsletter')}
                  </InputLabel>
                  <Select
                    label={t('Newsletter')}
                    labelId="newsletter-select-label"
                    value={sendNewsletter}
                    onChange={(e) =>
                      setFieldValue(
                        'sendNewsletter',
                        e.target.value as SendNewsletterEnum,
                      )
                    }
                  >
                    {Object.values(SendNewsletterEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {getLocalizedSendNewsletter(t, value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <Autocomplete
                  multiple
                  filterSelectedOptions
                  autoSelect
                  autoHighlight
                  options={
                    (filteredContacts &&
                      [...currentContacts, ...filteredContacts]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(({ id }) => id)) ||
                    []
                  }
                  getOptionLabel={(contactId) =>
                    (filteredContacts &&
                      [...currentContacts, ...filteredContacts].find(
                        ({ id }) => id === contactId,
                      )?.name) ??
                    ''
                  }
                  loading={loading}
                  inputValue={referredByName}
                  renderInput={(params): ReactElement => (
                    <TextField
                      {...params}
                      label={t('Referred By')}
                      onChange={(e) =>
                        handleUpdateReferredBySearch(e.target.value)
                      }
                    />
                  )}
                  value={
                    contactReferralsToMe.map(
                      (referral) => referral.referredById,
                    ) ?? undefined
                  }
                  onChange={(_, contactIds): void =>
                    updateReferredBy(contactIds, setFieldValue)
                  }
                  isOptionEqualToValue={(option, value): boolean =>
                    option === value
                  }
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CustomDateField
                  label={t('Next Increase Ask')}
                  value={nextAsk}
                  onChange={(nextAsk) => setFieldValue('nextAsk', nextAsk)}
                />
              </ContactInputWrapper>
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
