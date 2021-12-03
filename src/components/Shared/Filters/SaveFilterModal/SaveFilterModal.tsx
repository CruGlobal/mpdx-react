import React from 'react';
import { Field, FieldProps, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  styled,
  TextField,
} from '@material-ui/core';
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
import { useSaveFilterMutation } from './SaveFilterModal.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface SaveFilterModalProps {
  isOpen: boolean;
  handleClose: () => void;
  currentFilters: ContactFilterSetInput & TaskFilterSetInput;
}

const savedFilterSchema: yup.SchemaOf<
  Omit<CreateOrUpdateOptionMutationInput, 'clientMutationId'>
> = yup.object({
  key: yup
    .string()
    .matches(/^[a-zA-Z0-9 ]*$/, 'Invalid character in filter name')
    .required('Please enter a valid filter name'),
  value: yup.string().required(),
});

export const SaveFilterModal: React.FC<SaveFilterModalProps> = ({
  isOpen,
  handleClose,
  currentFilters,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { route } = useRouter();
  const filterPrefix = route.includes('contacts')
    ? 'graphql_saved_contacts_filter_'
    : 'graphql_saved_tasks_filter_';
  const [saveFilter, { loading: saving }] = useSaveFilterMutation();
  const onSubmit = async (attributes: CreateOrUpdateOptionMutationInput) => {
    const key = `${filterPrefix}${attributes.key.replaceAll(' ', '_')}`;
    await saveFilter({
      variables: {
        input: {
          key,
          value: attributes.value,
        },
      },
    });

    enqueueSnackbar(t('Filter saved successfully'), { variant: 'success' });
    handleClose();
  };

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
                {saving && <LoadingIndicator color="primary" size={20} />}
                {t('Save')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
