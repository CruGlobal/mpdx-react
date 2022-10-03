import React, { ReactElement } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogActions,
  DialogContent,
  CircularProgress,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import Modal from '../../../../../../common/Modal/Modal';
import {
  ContactUpdateInput,
  SendNewsletterEnum,
} from '../../../../../../../../graphql/types.generated';
import {
  ContactDetailsFragment,
  useUpdateContactDetailsMutation,
} from './EditContactDetails.generated';
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

const PrimaryContactIcon = styled(BookmarkIcon)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 8,
  transform: 'translateY(-50%)',
  color: theme.palette.cruGrayMedium.main,
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface EditContactDetailsModalProps {
  contact: ContactDetailsFragment;
  accountListId: string;
  isOpen: boolean;
  handleClose: () => void;
}

export const EditContactDetailsModal: React.FC<
  EditContactDetailsModalProps
> = ({
  accountListId,
  contact,
  isOpen,
  handleClose,
}): ReactElement<EditContactDetailsModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateContact, { loading: updating }] =
    useUpdateContactDetailsMutation();

  const contactSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      'name' | 'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
    >
  > = yup.object({
    name: yup.string().required(),
    id: yup.string().required(),
    primaryPersonId: yup.string().required(),
    greeting: yup.string().nullable(),
    envelopeGreeting: yup.string().nullable(),
    sendNewsletter: yup
      .mixed<SendNewsletterEnum>()
      .oneOf(Object.values(SendNewsletterEnum))
      .nullable(),
  });

  const onSubmit = async (attributes: ContactUpdateInput) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          name: attributes.name,
          id: attributes.id,
          primaryPersonId: attributes.primaryPersonId,
          greeting: attributes.greeting,
          envelopeGreeting: attributes.envelopeGreeting,
          sendNewsletter: attributes.sendNewsletter,
        },
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
      title={t('Edit Contact Details')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          name: contact.name,
          id: contact.id,
          primaryPersonId: contact?.primaryPerson?.id ?? '',
          greeting: contact.greeting,
          envelopeGreeting: contact.envelopeGreeting,
          sendNewsletter: contact.sendNewsletter,
        }}
        validationSchema={contactSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            name,
            primaryPersonId,
            greeting,
            envelopeGreeting,
            sendNewsletter,
          },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
          errors,
          touched,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <TextField
                    label={t('Contact')}
                    value={name}
                    onChange={handleChange('name')}
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
                <ContactInputWrapper>
                  <PrimaryContactIcon />

                  <FormControl fullWidth={true}>
                    <InputLabel id="primary-person-select-label">
                      {t('Primary')}
                    </InputLabel>
                    <Select
                      label={t('Primary')}
                      labelId="primary-person-select-label"
                      value={primaryPersonId}
                      onChange={(e) =>
                        setFieldValue('primaryPersonId', e.target.value)
                      }
                      fullWidth={true}
                    >
                      {contact.people.nodes.map((person) => {
                        return (
                          <MenuItem
                            key={person.id}
                            value={person.id}
                          >{`${person.firstName} ${person.lastName}`}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <FormControl fullWidth size="small">
                    <InputLabel id="send-newsletter-select-label">
                      {t('Newsletter')}
                    </InputLabel>
                    <Select
                      labelId="send-newsletter-select-label"
                      value={sendNewsletter}
                      onChange={handleChange('sendNewsletter')}
                      fullWidth={true}
                    >
                      {Object.values(SendNewsletterEnum).map((value) => (
                        <MenuItem key={value} value={value}>
                          {t(value)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={3}>
                    <Grid item sm={12} md={6}>
                      <TextField
                        label={t('Envelope Name Line')}
                        value={envelopeGreeting}
                        onChange={handleChange('envelopeGreeting')}
                        inputProps={{ 'aria-label': t('Envelope Name Line') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <TextField
                        label={t('Greeting (used in export)')}
                        value={greeting}
                        onChange={handleChange('greeting')}
                        inputProps={{ 'aria-label': t('Greeting') }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
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
