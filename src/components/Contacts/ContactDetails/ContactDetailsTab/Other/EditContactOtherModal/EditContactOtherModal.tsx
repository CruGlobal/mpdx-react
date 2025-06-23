import React, { ReactElement, useMemo, useState } from 'react';
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
  TextField,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NullableSelect } from 'src/components/NullableSelect/NullableSelect';
import { ContactsAutocomplete } from 'src/components/common/Autocomplete/ContactsAutocomplete/ContactsAutocomplete';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ContactUpdateInput,
  PreferredContactMethodEnum,
  UserScopedToAccountList,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useGetTimezones } from '../../../../../../hooks/useGetTimezones';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import Modal from '../../../../../common/Modal/Modal';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import { localizedContactMethod } from '../ContactDetailsOther';
import { ContactOtherFragment } from '../ContactOther.generated';
import {
  useAssigneeOptionsQuery,
  useChurchOptionsQuery,
  useUpdateContactOtherMutation,
} from './EditContactOther.generated';

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
}));

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 1),
  margin: theme.spacing(2, 0),
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const userName = (
  user: Pick<UserScopedToAccountList, 'firstName' | 'lastName'>,
): string => {
  const parts: string[] = [];
  if (user.firstName) {
    parts.push(user.firstName);
  }
  if (user.lastName) {
    parts.push(user.lastName);
  }
  return parts.join(' ');
};

interface EditContactOtherModalProps {
  contact: ContactOtherFragment;
  referral:
    | { id: string; referredBy: { id: string; name: string } }
    | undefined;
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
  const userLocale = useLocale();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  // Add additional language locales here, for multiline TextField support
  const multilineLocales = ['en', 'de'];

  const constants = useApiConstants();
  const languages = constants?.languages ?? [];
  const timezones = useGetTimezones();

  const [selectedId, setSelectedId] = useState(referral?.referredBy.id ?? '');

  const { data: dataChurchOptions, loading: loadingChurchOptions } =
    useChurchOptionsQuery({
      variables: {
        accountListId,
      },
    });
  const churches = dataChurchOptions?.accountList?.churches ?? [];

  const { data: dataAssigneeOptions, loading: loadingAssigneeOptions } =
    useAssigneeOptionsQuery({
      variables: {
        accountListId,
      },
    });
  const users = useMemo(
    () =>
      dataAssigneeOptions?.accountListUsers.nodes
        .map(({ user }) => user)
        .sort((a, b) => userName(a).localeCompare(userName(b))) ?? [],
    [dataAssigneeOptions],
  );

  const contactOtherSchema: yup.ObjectSchema<
    Pick<
      ContactUpdateInput,
      | 'id'
      | 'churchName'
      | 'preferredContactMethod'
      | 'locale'
      | 'timezone'
      | 'userId'
      | 'website'
      | 'greeting'
      | 'envelopeGreeting'
    > & { referredById: string | null | undefined }
  > = yup.object({
    id: yup.string().required(),
    userId: yup.string().nullable(),
    churchName: yup.string().nullable(),
    preferredContactMethod: yup
      .mixed<PreferredContactMethodEnum>()
      .oneOf(Object.values(PreferredContactMethodEnum))
      .nullable(),
    locale: yup.string().nullable(),
    timezone: yup.string().nullable(),
    website: yup.string().nullable(),
    greeting: yup.string().nullable(),
    envelopeGreeting: yup.string().nullable(),
    referredById: yup.string().nullable(),
  });

  const onSubmit = async (
    attributes: ContactUpdateInput & { referredById: string },
  ) => {
    const referralsInput =
      referral && referral.referredBy.id !== selectedId
        ? [
            {
              id: referral.id,
              destroy: true,
            },
            {
              referredById: attributes.referredById,
            },
          ]
        : selectedId
        ? [
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
          userId: attributes.userId,
          churchName: attributes.churchName,
          preferredContactMethod: attributes.preferredContactMethod,
          locale: attributes.locale,
          timezone: attributes.timezone,
          website: attributes.website,
          greeting: attributes.greeting,
          envelopeGreeting: attributes.envelopeGreeting,
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
          userId: contact.user?.id,
          churchName: contact.churchName,
          preferredContactMethod: contact.preferredContactMethod,
          locale: contact.locale,
          timezone: contact.timezone,
          website: contact.website,
          greeting: contact.greeting,
          envelopeGreeting: contact.envelopeGreeting,
          referredById:
            contact.contactReferralsToMe?.nodes[0]?.referredBy.id || '',
        }}
        validationSchema={contactOtherSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            userId,
            churchName,
            preferredContactMethod,
            locale,
            timezone,
            website,
            greeting,
            envelopeGreeting,
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
                <Grid container>
                  <Grid item xs={12}>
                    <ContactInputWrapper>
                      <TextField
                        label={t('Greeting')}
                        value={greeting}
                        onChange={handleChange('greeting')}
                        inputProps={{ 'aria-label': t('Greeting') }}
                        fullWidth
                      />
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12}>
                    <ContactInputWrapper>
                      <TextField
                        label={t('Envelope Name Line')}
                        multiline={multilineLocales.includes(userLocale)}
                        value={envelopeGreeting}
                        onChange={handleChange('envelopeGreeting')}
                        inputProps={{ 'aria-label': t('Envelope Name Line') }}
                        fullWidth
                      />
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <Autocomplete
                        loading={loadingAssigneeOptions}
                        autoSelect
                        autoHighlight
                        options={users.map(({ id }) => id)}
                        getOptionLabel={(userId) => {
                          const user = users.find(({ id }) => id === userId);
                          return user ? userName(user) : '';
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label={t('Assignee')} />
                        )}
                        value={userId ?? null}
                        onChange={(_, userId) => {
                          setFieldValue('userId', userId);
                        }}
                      />
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <FormControl fullWidth={true}>
                        <InputLabel
                          id="preferred-contact-method-select-label"
                          style={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
                        >
                          {t('Preferred Contact Method')}
                        </InputLabel>
                        <NullableSelect
                          label={t('Preferred Contact Method')}
                          labelId="preferred-contact-method-select-label"
                          value={preferredContactMethod}
                          onChange={(e) =>
                            setFieldValue(
                              'preferredContactMethod',
                              e.target.value,
                            )
                          }
                          fullWidth={true}
                        >
                          {Object.values(PreferredContactMethodEnum).map(
                            (value) => {
                              const contactMethod =
                                localizedContactMethod(value);
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
                        </NullableSelect>
                      </FormControl>
                    </ContactInputWrapper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <FormControl fullWidth>
                        <InputLabel id="language-select-label">
                          {t('Language')}
                        </InputLabel>
                        <NullableSelect
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
                              value.id &&
                              value.value && (
                                <MenuItem key={value.id} value={value.id}>
                                  {t(value.value)}
                                </MenuItem>
                              ),
                          )}
                        </NullableSelect>
                      </FormControl>
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <FormControl fullWidth>
                        <InputLabel id="timezone-select-label">
                          {t('Timezone')}
                        </InputLabel>
                        <NullableSelect
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
                        </NullableSelect>
                      </FormControl>
                    </ContactInputWrapper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <Autocomplete
                        loading={loadingChurchOptions}
                        autoSelect
                        autoHighlight
                        freeSolo
                        options={churches}
                        renderInput={(params): ReactElement => (
                          <TextField
                            {...params}
                            label={t('Church')}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingChurchOptions && (
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
                        value={churchName || ''}
                        onChange={(_, churchName): void => {
                          setFieldValue('churchName', churchName);
                        }}
                      />
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ContactInputWrapper>
                      <TextField
                        label={t('Website')}
                        value={website}
                        onChange={handleChange('website')}
                        inputProps={{ 'aria-label': t('Website') }}
                        fullWidth
                      />
                    </ContactInputWrapper>
                  </Grid>
                  <Grid item xs={12}>
                    <ContactInputWrapper>
                      <ContactsAutocomplete
                        accountListId={accountListId}
                        multiple={false}
                        openOnFocus={false}
                        autoHighlight
                        textFieldLabel={t('Connecting Partner')}
                        value={referredById || ''}
                        referral={referral}
                        onChange={(referredBy): void => {
                          setFieldValue('referredById', referredBy);
                          setSelectedId((referredBy as string) || '');
                        }}
                        isOptionEqualToValue={(option, value): boolean =>
                          value === option
                        }
                      />
                    </ContactInputWrapper>
                  </Grid>
                </Grid>
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
