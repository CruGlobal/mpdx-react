import React, { ReactElement } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../../../common/Modal/Modal';
import { useAddToAppealMutation } from './AddToAppealMutation.generated';

interface MassActionsCreateAppealModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const MassActionsAddToAppealSchema = yup.object({
  appeal: yup.string().nullable(),
});

export const MassActionsCreateAppealModal: React.FC<
  MassActionsCreateAppealModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const [createAppeal, { loading: updating }] = useAddToAppealMutation();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (field: { appeal: string }) => {
    await createAppeal({
      variables: {
        accountListId,
        attributes: {
          contactIds: ids,
          name: field.appeal,
        },
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Appeal created!'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal title={t('Create Appeal')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          appeal: '',
        }}
        onSubmit={onSubmit}
        validationSchema={MassActionsAddToAppealSchema}
      >
        {({
          values: { appeal },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="CreateAppealModal"
          >
            <DialogContent dividers>
              <FormControl fullWidth>
                <TextField
                  label={t('Appeal Name')}
                  value={appeal}
                  onChange={handleChange('appeal')}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': t('Appeal') }}
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
