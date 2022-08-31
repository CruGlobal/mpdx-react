import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  TextField,
} from '@mui/material';
import { Autocomplete } from '@mui/lab';
import { Formik } from 'formik';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import Modal from '../../../common/Modal/Modal';
import { useGetAppealsForMassActionQuery } from './GetAppealsForMassAction.generated';
import { useAddToAppealMutation } from './AddToAppealMutation.generated';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';

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

  const { data: appeals, loading: loadingAppeals } =
    useGetAppealsForMassActionQuery({
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
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <FormControl fullWidth>
                <Autocomplete
                  id="appeal"
                  value={appeal}
                  options={
                    (appeals?.appeals.nodes &&
                      appeals?.appeals.nodes.map((appeal) => appeal.id)) ||
                    []
                  }
                  getOptionLabel={(appealId): string => {
                    const currentAppeal = appeals?.appeals?.nodes.find(
                      (appeal) => appeal.id === appealId,
                    )?.name;
                    return currentAppeal ?? '';
                  }}
                  onChange={(_, appealId): void =>
                    setFieldValue('appeal', appealId)
                  }
                  getOptionSelected={(option, value): boolean =>
                    option === value
                  }
                  renderInput={(params): ReactElement => (
                    <TextField
                      {...params}
                      label={t('Appeal')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingAppeals && (
                              <CircularProgress color="primary" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
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
                variant="contained"
                disabled={!isValid || isSubmitting || !appeal}
              >
                {updating && <CircularProgress color="primary" size={20} />}
                {t('Save')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
