import React, { ReactElement } from 'react';
import { DialogActions, DialogContent, Grid } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactsAutocomplete } from 'src/components/Task/Modal/Form/Inputs/ContactsAutocomplete/ContactsAutocomplete';
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
import { useAppealQuery } from './appealInfo.generated';

interface AddContactToAppealModalProps {
  handleClose: () => void;
}

export type AddContactFormikSchema = {
  contactIds: string[];
};

const AddContactSchema: yup.SchemaOf<AddContactFormikSchema> = yup.object({
  contactIds: yup.array().of(yup.string().required()).default([]),
});

export const AddContactToAppealModal: React.FC<
  AddContactToAppealModalProps
> = ({ handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [assignContactsToAppeal] = useAssignContactsToAppealMutation();
  const { accountListId, appealId, contactsQueryResult } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  const { data } = useAppealQuery({
    variables: {
      accountListId: accountListId ?? '',
      appealId: appealId ?? '',
    },
  });

  const existingContactIds = data?.appeal?.contactIds ?? [];

  const onSubmit = async (attributes: AddContactFormikSchema) => {
    await assignContactsToAppeal({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: appealId,
            contactIds: [...existingContactIds, ...attributes.contactIds],
          },
        },
      },
      update: () => {
        contactsQueryResult.refetch();
      },
      onCompleted: () => {
        const successMessage =
          attributes.contactIds.length === 1
            ? t('1 contact successfully added to your appeal.')
            : t('{{count}} contacts successfully added to your appeal.', {
                count: attributes.contactIds.length,
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
    <Modal title={t('Add Contact(s)')} isOpen={true} handleClose={handleClose}>
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
        }): ReactElement => (
          <form onSubmit={handleSubmit} data-testid="addContactToAppealModal">
            <DialogContent>
              <Grid item>
                <ContactsAutocomplete
                  accountListId={accountListId ?? ''}
                  value={contactIds}
                  onChange={(contactIds) => {
                    contactIds;
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
        )}
      </Formik>
    </Modal>
  );
};
