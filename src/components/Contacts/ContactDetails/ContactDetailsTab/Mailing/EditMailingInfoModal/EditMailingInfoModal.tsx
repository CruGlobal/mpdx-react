import React, { ReactElement } from 'react';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { NewsletterSelect } from 'src/components/common/NewsletterSelect/NewsletterSelect';
import {
  Contact,
  ContactUpdateInput,
  SendNewsletterEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import Modal from '../../../../../common/Modal/Modal';
import { useEditMailingInfoMutation } from './EditMailingInfoModal.generated';

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

interface EditMailingInfoModalProps {
  accountListId: string;
  contact: Pick<
    Contact,
    'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
  >;
  handleClose: () => void;
}

export const EditMailingInfoModal: React.FC<EditMailingInfoModalProps> = ({
  accountListId,
  contact,
  handleClose,
}): ReactElement<EditMailingInfoModalProps> => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [editMailingInfo, { loading: updating }] = useEditMailingInfoMutation();
  // Add additional language locales here, for multiline TextField support
  const multilineLocales = ['de'];

  const mailingInfoSchema: yup.ObjectSchema<
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

  const onSubmit = async (
    attributes: Pick<
      ContactUpdateInput,
      'id' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter'
    >,
  ) => {
    await editMailingInfo({
      variables: {
        accountListId,
        attributes,
      },
    });
    enqueueSnackbar(t('Mailing information edited successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit Mailing Information')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          id: contact.id,
          greeting: contact.greeting ?? '',
          envelopeGreeting: contact.envelopeGreeting ?? '',
          sendNewsletter: contact.sendNewsletter ?? SendNewsletterEnum.None,
        }}
        validationSchema={mailingInfoSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { greeting, envelopeGreeting, sendNewsletter },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <TextField
                    label={t('Greeting')}
                    value={greeting}
                    onChange={handleChange('greeting')}
                    inputProps={{ 'aria-label': t('Greeting') }}
                    fullWidth
                  />
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <TextField
                    label={t('Envelope Name Line')}
                    multiline={multilineLocales.includes(locale)}
                    value={envelopeGreeting}
                    onChange={handleChange('envelopeGreeting')}
                    inputProps={{ 'aria-label': t('Envelope Name Line') }}
                    fullWidth
                  />
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <FormControl fullWidth>
                    <InputLabel id="send-newsletter-select-label">
                      {t('Newsletter')}
                    </InputLabel>
                    <NewsletterSelect
                      label={t('Newsletter')}
                      labelId="send-newsletter-select-label"
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
