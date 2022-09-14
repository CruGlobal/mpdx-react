import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import Modal from '../../../../../../common/Modal/Modal';
import { ContactUpdateInput } from '../../../../../../../../graphql/types.generated';
import { ContactPeopleFragment } from '../../ContactPeople.generated';
import { useUpdateContactDetailsMutation } from './EditContactDetails.generated';

const ContactEditModalFooterButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 'bold',
}));

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
  contact: ContactPeopleFragment;
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

  const contactSchema: yup.SchemaOf<Pick<ContactUpdateInput, 'name' | 'id'>> =
    yup.object({
      name: yup.string().required(),
      id: yup.string().required(),
      primaryPersonId: yup.string().required(),
    });

  const onSubmit = async (attributes: ContactUpdateInput) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          name: attributes.name,
          id: attributes.id,
          primaryPersonId: attributes.primaryPersonId,
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
      title={t('Edit Contact Details')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          name: contact.name,
          id: contact.id,
          primaryPersonId: contact?.primaryPerson?.id ?? '',
        }}
        validationSchema={contactSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { name, primaryPersonId },
          handleChange,
          handleSubmit,
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
                      onChange={handleChange('primaryPersonId')}
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
              </ContactEditContainer>
            </DialogContent>
            <DialogActions>
              <ContactEditModalFooterButton
                onClick={handleClose}
                disabled={isSubmitting}
                variant="text"
              >
                {t('Cancel')}
              </ContactEditModalFooterButton>
              <ContactEditModalFooterButton
                type="submit"
                variant="text"
                disabled={!isValid || isSubmitting}
              >
                {updating && <LoadingIndicator color="primary" size={20} />}
                {t('Save')}
              </ContactEditModalFooterButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
