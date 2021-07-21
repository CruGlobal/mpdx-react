import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  styled,
  TextField,
} from '@material-ui/core';
import {
  ContactUpdateInput,
  PreferredContactMethodEnum,
} from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import { ContactDetailsTabQuery } from '../../ContactDetailsTab.generated';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import { useGetTimezones } from '../../../../../../hooks/useGetTimezones';
import { localizedContactMethod } from '../ContactDetailsOther';
import { useUpdateContactOtherMutation } from './EditContactOther.generated';

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
  contact: ContactDetailsTabQuery['contact'];
  accountListId: string;
  isOpen: boolean;
  handleClose: () => void;
}

export const EditContactOtherModal: React.FC<EditContactOtherModalProps> = ({
  accountListId,
  contact,
  isOpen,
  handleClose,
}): ReactElement<EditContactOtherModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [
    updateContactOther,
    { loading: updating },
  ] = useUpdateContactOtherMutation();

  const constants = useApiConstants();
  const languages = constants?.languages ?? [];
  const timezones = useGetTimezones();

  const contactOtherSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      | 'id'
      | 'churchName'
      | 'preferredContactMethod'
      | 'locale'
      | 'timezone'
      | 'website'
    >
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
  });

  const onSubmit = async (attributes: ContactUpdateInput) => {
    try {
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
          },
        },
      });
      enqueueSnackbar(t('Contact updated successfully'), {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
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
          },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <FormControl fullWidth={true}>
                    <InputLabel id="preferred-contact-method-select-label">
                      {t('Preferred Contact Method')}
                    </InputLabel>
                    <Select
                      labelId="preferred-contact-method-select-label"
                      value={preferredContactMethod}
                      onChange={handleChange('preferredContactMethod')}
                      fullWidth={true}
                    >
                      {Object.values(PreferredContactMethodEnum).map(
                        (value) => (
                          <MenuItem key={value} value={value}>
                            {localizedContactMethod(value)}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="language-select-label">
                          {t('Language')}
                        </InputLabel>
                        <Select
                          labelId="language-select-label"
                          value={locale}
                          onChange={handleChange('locale')}
                          fullWidth={true}
                          MenuProps={{
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
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="timezone-select-label">
                          {t('Timezone')}
                        </InputLabel>
                        <Select
                          labelId="timezone-select-label"
                          value={timezone}
                          onChange={handleChange('timezone')}
                          fullWidth={true}
                          MenuProps={{
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
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="text"
              >
                {t('Cancel')}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="text"
                disabled={!isValid || isSubmitting}
              >
                {updating && <LoadingIndicator color="primary" size={20} />}
                {t('Save')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
