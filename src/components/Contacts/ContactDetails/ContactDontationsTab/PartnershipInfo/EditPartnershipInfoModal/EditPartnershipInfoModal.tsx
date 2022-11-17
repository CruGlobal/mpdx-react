import React, { ReactElement, useState } from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarToday from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import Modal from '../../../../../common/Modal/Modal';
import { ContactDonorAccountsFragment } from '../../ContactDonationsTab.generated';
import {
  ContactReferralToMeInput,
  ContactUpdateInput,
  PledgeFrequencyEnum,
  StatusEnum,
} from '../../../../../../../graphql/types.generated';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import {
  useUpdateContactPartnershipMutation,
  useGetDataForPartnershipInfoModalQuery,
} from './EditPartnershipInfoModal.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';

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

  const contactPartnershipSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      | 'id'
      | 'status'
      | 'pledgeAmount'
      | 'pledgeFrequency'
      | 'pledgeCurrency'
      | 'pledgeReceived'
      | 'pledgeStartDate'
      | 'nextAsk'
      | 'noAppeals'
      | 'contactReferralsToMe'
    >
  > = yup.object({
    id: yup.string().required(),
    status: yup.mixed<StatusEnum>().oneOf(Object.values(StatusEnum)).nullable(),
    pledgeAmount: yup.number().moreThan(-1).nullable(),
    pledgeStartDate: yup.string().nullable(),
    pledgeReceived: yup.boolean().default(false).nullable(),
    pledgeCurrency: yup.string().nullable(),
    nextAsk: yup.string().nullable(),
    noAppeals: yup.boolean().default(false).nullable(),
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
  });

  const onSubmit = async (
    attributes: Pick<
      ContactUpdateInput,
      | 'id'
      | 'status'
      | 'pledgeAmount'
      | 'pledgeFrequency'
      | 'pledgeCurrency'
      | 'pledgeReceived'
      | 'pledgeStartDate'
      | 'nextAsk'
      | 'noAppeals'
      | 'contactReferralsToMe'
    >,
  ) => {
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
    if (status !== StatusEnum.PartnerFinancial) {
      setFieldValue('status', status);
      setFieldValue('pledgeAmount', 0);
      setFieldValue('pledgeFrequency', null);
    } else {
      setFieldValue('status', status);
    }
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit Partnership')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          id: contact.id,
          status: contact.status,
          pledgeAmount: contact.pledgeAmount,
          pledgeFrequency: contact.pledgeFrequency,
          pledgeReceived: contact.pledgeReceived,
          pledgeCurrency: contact.pledgeCurrency,
          pledgeStartDate: contact.pledgeStartDate,
          nextAsk: contact.nextAsk,
          noAppeals: contact.noAppeals,
          contactReferralsToMe: contactReferrals,
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
            contactReferralsToMe,
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
            <DialogContent dividers>
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
                    {Object.values(StatusEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {getLocalizedContactStatus(t, value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <TextField
                  label={t('Amount')}
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
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="frequency-select-label">
                    {t('Frequency')}
                  </InputLabel>
                  <Select
                    label={t('Frequency')}
                    labelId="frequency-select-label"
                    value={pledgeFrequency ?? ''}
                    disabled={status !== StatusEnum.PartnerFinancial}
                    aria-readonly={status !== StatusEnum.PartnerFinancial}
                    onChange={(e) =>
                      setFieldValue('pledgeFrequency', e.target.value)
                    }
                    IconComponent={() =>
                      status !== StatusEnum.PartnerFinancial ? (
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
                      ) : (
                        <ArrowDropDownIcon />
                      )
                    }
                  >
                    <MenuItem value={''} disabled></MenuItem>
                    {Object.values(PledgeFrequencyEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {t(value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <MobileDatePicker
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      inputProps={{ 'aria-label': t('Start Date') }}
                      {...params}
                    />
                  )}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        aria-label="change start date"
                        position="end"
                      >
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(date): void =>
                    setFieldValue('pledgeStartDate', date)
                  }
                  value={
                    pledgeStartDate
                      ? DateTime.fromISO(pledgeStartDate).toLocaleString()
                      : null
                  }
                  inputFormat="MM/dd/yyyy"
                  label={t('Start Date')}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <Autocomplete
                  multiple
                  filterSelectedOptions
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
                <MobileDatePicker
                  renderInput={(params) => (
                    <TextField
                      fullWidth
                      inputProps={{ 'aria-label': t('Next Ask Increase') }}
                      {...params}
                    />
                  )}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        aria-label="change next ask date"
                        position="end"
                      >
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(date) =>
                    !date ? null : setFieldValue('nextAsk', date)
                  }
                  value={
                    nextAsk ? DateTime.fromISO(nextAsk).toLocaleString() : null
                  }
                  inputFormat="MM/dd/yyyy"
                  label={t('Next Ask Increase')}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CheckboxLabel
                  control={
                    <Checkbox
                      checked={pledgeReceived}
                      onChange={() =>
                        setFieldValue('pledgeReceived', !pledgeReceived)
                      }
                      color="secondary"
                    />
                  }
                  label={t('Commitment Recieved')}
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
