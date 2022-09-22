import React, { ReactElement, useCallback, useEffect } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  Autocomplete,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import debounce from 'lodash/fp/debounce';
import {
  ContactUpdateInput,
  PreferredContactMethodEnum,
} from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import { useGetTimezones } from '../../../../../../hooks/useGetTimezones';
import { localizedContactMethod } from '../ContactDetailsOther';
import { ContactOtherFragment } from '../ContactOther.generated';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../../ContactDetailContext';
import { useUpdateContactOtherMutation } from './EditContactOther.generated';
import { useGetTaskModalContactsFilteredQuery } from 'src/components/Task/Drawer/Form/TaskDrawer.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(4, 0),
}));

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface EditContactOtherModalProps {
  contact: ContactOtherFragment;
  referral: { id: string; referredBy: { id: string; name: string } };
  accountListId: string;
  isOpen: boolean;
  handleClose: () => void;
}

export const EditContactOtherModal: React.FC<EditContactOtherModalProps> = ({
  accountListId,
  contact,
  referral,
  isOpen,
  handleClose,
}): ReactElement<EditContactOtherModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateContactOther, { loading: updating }] =
    useUpdateContactOtherMutation();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const constants = useApiConstants();
  const languages = constants?.languages ?? [];
  const timezones = useGetTimezones();

  const {
    selectedReferralId: selectedId,
    setSelectedReferralId: setSelectedId,
    searchReferrelName: searchTerm,
    setSearchReferralName: setSearchTerm,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;

  useEffect(() => {
    setSelectedId(referral?.referredBy.id);
    setSearchTerm(referral?.referredBy.name);
  }, []);

  const handleSearchTermChange = useCallback(
    debounce(500, (event) => {
      setSearchTerm(event.target.value);
    }),
    [],
  );

  const { data: dataFilteredByName, loading: loadingFilteredByName } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        contactsFilters: { wildcardSearch: searchTerm as string },
      },
    });

  const { data: dataFilteredById, loading: loadingFilteredById } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        contactsFilters: { ids: [selectedId] },
      },
    });

  const mergedContacts =
    dataFilteredByName && dataFilteredById
      ? dataFilteredByName?.contacts.nodes
          .concat(dataFilteredById?.contacts.nodes)
          .filter(
            (contact1, index, self) =>
              self.findIndex((contact2) => contact2.id === contact1.id) ===
              index,
          )
      : dataFilteredById?.contacts.nodes ||
        dataFilteredByName?.contacts.nodes ||
        [];

  const contactOtherSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      | 'id'
      | 'churchName'
      | 'preferredContactMethod'
      | 'locale'
      | 'timezone'
      | 'website'
    > & { referredById: string | undefined }
  > = yup.object({
    id: yup.string().required(),
    churchName: yup.string().nullable(),
    preferredContactMethod: yup
      .mixed<PreferredContactMethodEnum>()
      .oneOf(Object.values(PreferredContactMethodEnum))
      .nullable(),
    locale: yup.string().nullable(),
    timezone: yup.string().nullable(),
    website: yup.string().nullable(),
    referredById: yup.string(),
  });

  const onSubmit = async (
    attributes: ContactUpdateInput & { referredById: string },
  ) => {
    const referralsInput =
      referral.referredBy.id !== selectedId
        ? [
            {
              id: referral.id,
              destroy: true,
            },
            {
              referredById: attributes.referredById,
            },
          ]
        : [{}];
    await updateContactOther({
      variables: {
        accountListId,
        attributes: {
          id: attributes.id,
          churchName: attributes.churchName,
          preferredContactMethod: attributes.preferredContactMethod,
          locale: attributes.locale,
          timezone: attributes.timezone,
          website: attributes.website,
          contactReferralsToMe: referralsInput,
        },
      },
      update: (cache, { data: updatedContact }) => {
        const updatedContactReferrals =
          updatedContact?.updateContact?.contact.contactReferralsToMe;
        const query = {
          query: ContactDetailsTabDocument,
          variables: {
            accountListId,
            contactId: contact.id,
          },
        };

        const dataFromCache = cache.readQuery<ContactDetailsTabQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            contact: {
              ...dataFromCache.contact,
              contactReferralsToMe: updatedContactReferrals,
            },
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
    enqueueSnackbar(t('Contact updated successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('Edit Contact Other Details')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          id: contact.id,
          churchName: contact.churchName,
          preferredContactMethod: contact.preferredContactMethod,
          locale: contact.locale,
          timezone: contact.timezone,
          website: contact.website,
          referredById:
            contact.contactReferralsToMe?.nodes[0]?.referredBy.id || '',
        }}
        validationSchema={contactOtherSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            churchName,
            preferredContactMethod,
            locale,
            timezone,
            website,
            referredById,
          },
          setFieldValue,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <Grid item>
                    <Autocomplete
                      loading={loadingFilteredById || loadingFilteredByName}
                      options={
                        (
                          mergedContacts &&
                          [...mergedContacts].sort((a, b) =>
                            a.name.localeCompare(b.name),
                          )
                        )?.map(({ id }) => id) || []
                      }
                      getOptionLabel={(contactId) =>
                        mergedContacts.find(({ id }) => id === contactId)
                          ?.name ?? ''
                      }
                      renderInput={(params): ReactElement => (
                        <TextField
                          {...params}
                          onChange={handleSearchTermChange}
                          label={t('Referred By')}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {(loadingFilteredById ||
                                  loadingFilteredByName) && (
                                  <CircularProgress color="primary" size={20} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      value={referredById}
                      onChange={(_, referredBy): void => {
                        setFieldValue('referredById', referredBy);
                        setSelectedId(referredBy || '');
                      }}
                      isOptionEqualToValue={(option, value): boolean =>
                        option === value
                      }
                    />
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <FormControl fullWidth={true}>
                    <InputLabel
                      id="preferred-contact-method-select-label"
                      style={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
                    >
                      {t('Preferred Contact Method')}
                    </InputLabel>
                    <Select
                      label={t('Preferred Contact Method')}
                      labelId="preferred-contact-method-select-label"
                      value={preferredContactMethod}
                      onChange={(e) =>
                        setFieldValue('preferredContactMethod', e.target.value)
                      }
                      fullWidth={true}
                    >
                      {Object.values(PreferredContactMethodEnum).map(
                        (value) => {
                          const contactMethod = localizedContactMethod(value);
                          return (
                            <MenuItem
                              key={value}
                              value={value}
                              aria-label={contactMethod}
                            >
                              {contactMethod}
                            </MenuItem>
                          );
                        },
                      )}
                    </Select>
                  </FormControl>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="language-select-label">
                          {t('Language')}
                        </InputLabel>
                        <Select
                          label={t('Language')}
                          labelId="language-select-label"
                          value={locale}
                          onChange={(e) =>
                            setFieldValue('locale', e.target.value)
                          }
                          fullWidth={true}
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
                          {languages.map(
                            (value) =>
                              value?.value && (
                                <MenuItem key={value.id} value={value.value}>
                                  {t(value.value)}
                                </MenuItem>
                              ),
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="timezone-select-label">
                          {t('Timezone')}
                        </InputLabel>
                        <Select
                          label={t('Timezone')}
                          labelId="timezone-select-label"
                          value={timezone}
                          onChange={(e) =>
                            setFieldValue('timezone', e.target.value)
                          }
                          fullWidth={true}
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
                          {timezones.map(({ key, value }) => (
                            <MenuItem key={key} value={value}>
                              {t(value)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <TextField
                    label={t('Church')}
                    value={churchName}
                    onChange={handleChange('churchName')}
                    inputProps={{ 'aria-label': t('Church') }}
                    fullWidth
                  />
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <TextField
                    label={t('Website')}
                    value={website}
                    onChange={handleChange('website')}
                    inputProps={{ 'aria-label': t('Website') }}
                    fullWidth
                  />
                </ContactInputWrapper>
              </ContactEditContainer>
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
