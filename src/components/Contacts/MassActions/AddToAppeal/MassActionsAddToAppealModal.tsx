import React, { ReactElement } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { AppealAutocomplete } from 'src/common/Autocompletes/AppealAutocomplete';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../../../common/Modal/Modal';
import { useAddToAppealMutation } from './AddToAppealMutation.generated';
import { useGetAppealsForMassActionQuery } from './GetAppealsForMassAction.generated';

interface MassActionsAddToAppealModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const MassActionsAddToAppealSchema = yup.object({
  appeal: yup.string().nullable(),
});

export const MassActionsAddToAppealModal: React.FC<
  MassActionsAddToAppealModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const [addToAppeal, { loading: updating }] = useAddToAppealMutation();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (field: { appeal: string }) => {
    const existingIds =
      appeals?.appeals.nodes.find((appeal) => appeal.id === field.appeal)
        ?.contactIds ?? [];
    await addToAppeal({
      variables: {
        accountListId,
        attributes: {
          contactIds: [...ids, ...existingIds],
          id: field.appeal,
        },
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Contacts updated!'), {
      variant: 'success',
    });
    handleClose();
  };

  const { data: appeals } = useGetAppealsForMassActionQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <Modal title={t('Add To Appeal')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          appeal: '',
        }}
        onSubmit={onSubmit}
        validationSchema={MassActionsAddToAppealSchema}
      >
        {({
          values: { appeal },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="AddToAppealModal"
          >
            <DialogContent dividers>
              <FormControl fullWidth>
                <AppealAutocomplete
                  id="appeal"
                  value={appeal}
                  data-testid="appealTextInput"
                  onChange={(_, appealId): void =>
                    setFieldValue('appeal', appealId)
                  }
                  accountListId={accountListId}
                  TextFieldProps={{
                    label: t('Appeal'),
                  }}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting || !appeal}>
                {updating && <CircularProgress color="primary" size={20} />}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
