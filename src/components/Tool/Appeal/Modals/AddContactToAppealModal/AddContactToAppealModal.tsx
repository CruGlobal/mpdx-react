import React, { ReactElement, useMemo } from 'react';
import { Alert, DialogActions, DialogContent, Grid } from '@mui/material';
import { Box } from '@mui/system';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactsAutocomplete } from 'src/components/common/Autocomplete/ContactsAutocomplete/ContactsAutocomplete';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { useAssignContactsToAppealMutation } from './AddContactToAppeal.generated';
import { useAppealContactsQuery } from './AppealContacts.generated';

interface AddContactToAppealModalProps {
  handleClose: () => void;
}

interface AddContactFormikSchema {
  contactIds: string[];
}

const AddContactSchema: yup.ObjectSchema<AddContactFormikSchema> = yup.object({
  contactIds: yup.array().of(yup.string().required()).default([]),
});

export const AddContactToAppealModal: React.FC<
  AddContactToAppealModalProps
> = ({ handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [assignContactsToAppeal] = useAssignContactsToAppealMutation();
  const { accountListId, appealId } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  const { data } = useAppealContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      appealId: appealId ?? '',
    },
  });

  const existingContactIds = data?.appeal?.contactIds ?? [];
  const excludedContacts = data?.appeal?.excludedAppealContacts ?? [];

  const onSubmit = async ({ contactIds }: AddContactFormikSchema) => {
    const excludedContactIds = excludedContacts.map(
      (excludedContact) => excludedContact.contact?.id,
    );
    const addingExcludedContact = contactIds.some((contactId) =>
      excludedContactIds.includes(contactId),
    );

    await assignContactsToAppeal({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: appealId,
            contactIds: [...existingContactIds, ...contactIds],
            forceListDeletion: addingExcludedContact,
          },
        },
      },
      refetchQueries: ['Contacts'],
      onCompleted: () => {
        const successMessage =
          contactIds.length === 1
            ? t('1 contact successfully added to your appeal.')
            : t('{{count}} contacts successfully added to your appeal.', {
                count: contactIds.length,
              });
        enqueueSnackbar(successMessage, {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(t('Failed to add contact(s) to the appeal'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Modal
      title={t('Add Contact(s) to Appeal')}
      isOpen={true}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          contactIds: [],
        }}
        validationSchema={AddContactSchema}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          values: { contactIds },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => {
          const excludedContactNames = useMemo(() => {
            return contactIds.reduce<string[]>((result, contactId) => {
              const excludedContact = excludedContacts.find(
                (excludedContact) => excludedContact.contact?.id === contactId,
              );
              if (excludedContact && excludedContact.contact?.name) {
                return [...result, excludedContact.contact?.name];
              }
              return result;
            }, []);
          }, [contactIds, excludedContacts]);
          return (
            <form onSubmit={handleSubmit} data-testid="addContactToAppealModal">
              <DialogContent>
                <Grid item>
                  {!!excludedContactNames.length && (
                    <Alert
                      severity="info"
                      data-testid="excludedContactMessage"
                      sx={{ marginBottom: 1 }}
                    >
                      {t(
                        'Some of the contact(s) you have selected to add to this appeal are currently excluded. You will not be able to exclude these contacts once you add them to this appeal. Instead, you will be able to remove them from it.',
                      )}
                      <Box pt={1} display="flex" gap={1}>
                        {excludedContactNames.map((name) => (
                          <Box key={name}>{name}</Box>
                        ))}
                      </Box>
                    </Alert>
                  )}
                  <ContactsAutocomplete
                    accountListId={accountListId ?? ''}
                    value={contactIds}
                    onChange={(contactIds) => {
                      setFieldValue('contactIds', contactIds);
                    }}
                    excludeContactIds={existingContactIds}
                  />
                </Grid>
              </DialogContent>
              <DialogActions>
                <CancelButton onClick={handleClose} disabled={isSubmitting} />

                <SubmitButton disabled={!isValid || isSubmitting}>
                  {t('Save')}
                </SubmitButton>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
};
