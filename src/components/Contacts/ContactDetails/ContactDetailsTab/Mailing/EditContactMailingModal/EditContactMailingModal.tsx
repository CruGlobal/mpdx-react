import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
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
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import {
  ContactUpdateInput,
  SendNewsletterEnum,
} from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import { ContactMailingFragment } from '../ContactMailing.generated';
import { useUpdateContactMailingMutation } from './EditContactMailingModal.generated';

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

interface EditContactMailingModalProps {
  accountListId: string;
  contact: ContactMailingFragment;
  handleClose: () => void;
  isOpen: boolean;
}

export const EditContactMailingModal: React.FC<
  EditContactMailingModalProps
> = ({
  accountListId,
  contact,
  handleClose,
  isOpen,
}): ReactElement<EditContactMailingModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const contactMailingSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
    >
  > = yup.object({
    id: yup.string().required(),
    greeting: yup.string().nullable(),
    envelopeGreeting: yup.string().nullable(),
    sendNewsletter: yup
      .mixed<SendNewsletterEnum>()
      .oneOf(Object.values(SendNewsletterEnum))
      .nullable(),
  });

  const [updatContactMailing, { loading: updating }] =
    useUpdateContactMailingMutation();

  const onSubmit = async (
    attributes: Pick<
      ContactUpdateInput,
      'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
    >,
  ) => {
    await updatContactMailing({
      variables: {
        accountListId,
        attributes: {
          id: attributes.id,
          greeting: attributes.greeting,
          envelopeGreeting: attributes.envelopeGreeting,
          sendNewsletter: attributes.sendNewsletter,
        },
      },
    });
    enqueueSnackbar(t('Contact updated successfully'), {
      variant: 'success',
    });
  };
  return (
    <Modal
      isOpen={isOpen}
      title={t('Edit Contact Mailing Details')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          id: contact.id,
          greeting: contact.greeting,
          envelopeGreeting: contact.envelopeGreeting,
          sendNewsletter: contact.sendNewsletter,
        }}
        validationSchema={contactMailingSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { greeting, envelopeGreeting, sendNewsletter },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <FormControl fullWidth size="small">
                    <InputLabel id="send-newsletter-select-label">
                      {t('Newsletter')}
                    </InputLabel>
                    <Select
                      labelId="send-newsletter-select-label"
                      value={sendNewsletter}
                      onChange={(e) =>
                        setFieldValue('sendNewsletter', e.target.value)
                      }
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
