import React, { useState } from 'react';
import { Field, FieldProps, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  ContactFilterSetInput,
  CreateOrUpdateOptionMutationInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import { useAccountListId } from '../../../../hooks/useAccountListId';
import { UserOptionFragment } from '../FilterPanel.generated';
import { useSaveFilterMutation } from './SaveFilterModal.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface SaveFilterModalProps {
  isOpen: boolean;
  handleClose: () => void;
  currentFilters: ContactFilterSetInput & TaskFilterSetInput;
  currentSavedFilters: UserOptionFragment[];
}

export const SaveFilterModal: React.FC<SaveFilterModalProps> = ({
  isOpen,
  handleClose,
  currentFilters,
  currentSavedFilters,
}) => {
  //#region Hooks
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmModalStatus, setConfirmModalStatus] = useState({
    isOpen: false,
    key: '',
    value: '',
  });
  const { route } = useRouter();
  //#endregion

  //#region Saving Filter Logic
  const savedFilterSchema: yup.SchemaOf<
    Omit<CreateOrUpdateOptionMutationInput, 'clientMutationId'>
  > = yup.object({
    key: yup
      .string()
      .matches(/^[a-zA-Z0-9 ]*$/, 'Invalid character in filter name')
      .required('Please enter a valid filter name'),
    value: yup.string().required(),
  });

  const filterPrefix = route.includes('contacts')
    ? 'graphql_saved_contacts_filter_'
    : 'graphql_saved_tasks_filter_';
  const currentSavedFiltersNames = currentSavedFilters.map(({ key }) =>
    key?.replace(
      /(?:^|\W)graphql_|saved_|contacts_|tasks_|filter_|(?:$|\W)/gm,
      '',
    ),
  );

  const [saveFilter, { loading: saving }] = useSaveFilterMutation();

  const handleSaveFilter = async (key: string, value: string) => {
    await saveFilter({
      variables: {
        input: {
          key,
          value,
        },
      },
    });

    enqueueSnackbar(t('Filter saved successfully'), { variant: 'success' });
    handleClose();
  };
  const renderConfirmModal = () => {
    const handleNoChoice = () => {
      setConfirmModalStatus({ isOpen: false, key: '', value: '' });
    };

    const handleYesChoice = () => {
      handleSaveFilter(confirmModalStatus.key, confirmModalStatus.value);
      setConfirmModalStatus({ isOpen: false, key: '', value: '' });
    };

    return (
      <Modal
        isOpen={confirmModalStatus.isOpen}
        title={t('Confirm')}
        handleClose={() =>
          setConfirmModalStatus({ isOpen: false, key: '', value: '' })
        }
      >
        <DialogContent dividers>
          <Typography>
            {t(
              'A filter with that name already exists. Do you wish to replace it?',
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleNoChoice}>{t('No')}</CancelButton>
          <SubmitButton type="button" onClick={handleYesChoice}>
            {saving ? (
              <CircularProgress color="secondary" size={20} />
            ) : (
              t('Yes')
            )}
          </SubmitButton>
        </DialogActions>
      </Modal>
    );
  };

  const onSubmit = async (attributes: CreateOrUpdateOptionMutationInput) => {
    const formatedFilterName = attributes.key.replaceAll(' ', '_');
    const key = `${filterPrefix}${formatedFilterName}`;
    if (currentSavedFiltersNames.includes(formatedFilterName)) {
      setConfirmModalStatus({ isOpen: true, key, value: attributes.value });
      return;
    }
    handleSaveFilter(key, attributes.value);
  };
  //#endregion

  //#region JSX
  return (
    <Modal isOpen={isOpen} title={t('Save Filter')} handleClose={handleClose}>
      <Formik
        initialValues={{
          key: '',
          value: JSON.stringify({ ...currentFilters, accountListId }),
        }}
        validationSchema={savedFilterSchema}
        onSubmit={onSubmit}
      >
        {({ isValid, isSubmitting }) => (
          <Form>
            <DialogContent dividers>
              <Field name="key">
                {({ field, meta }: FieldProps) => (
                  <FormControl fullWidth error={meta.touched && !!meta.error}>
                    <TextField
                      fullWidth
                      label={t('Filter name')}
                      type="text"
                      inputProps={{ 'aria-label': t('Filter name') }}
                      {...field}
                    />
                    <FormHelperText>
                      {meta.touched && meta.error}
                    </FormHelperText>
                  </FormControl>
                )}
              </Field>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {saving ? (
                  <CircularProgress color="secondary" size={20} />
                ) : (
                  t('Save')
                )}
              </SubmitButton>
            </DialogActions>
          </Form>
        )}
      </Formik>
      {renderConfirmModal()}
    </Modal>
  );
  //#endregion
};
