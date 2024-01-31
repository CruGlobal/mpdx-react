import React, { ReactElement } from 'react';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import Modal from 'src/components/common/Modal/Modal';
import {
  ContactDetailsFragment,
  useUpdateContactDetailsMutation,
} from './EditContactDetails.generated';

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

const contactSchema = yup.object({
  name: yup.string().required(),
  primaryPersonId: yup.string().required(),
});

type Attributes = yup.InferType<typeof contactSchema>;

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

  const onSubmit = async (attributes: Attributes) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          id: contact.id,
          name: attributes.name,
          primaryPersonId: attributes.primaryPersonId,
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
          primaryPersonId: contact?.primaryPerson?.id ?? '',
        }}
        validationSchema={contactSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { name, primaryPersonId },
          handleChange,
          handleBlur,
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
                    name="name"
                    label={t('Contact')}
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
                      {contact.people.nodes.map((person) => (
                        <MenuItem
                          key={person.id}
                          value={person.id}
                        >{`${person.firstName} ${person.lastName}`}</MenuItem>
                      ))}
                    </Select>
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
