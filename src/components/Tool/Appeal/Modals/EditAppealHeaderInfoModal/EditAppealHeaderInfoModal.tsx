import React, { ReactElement } from 'react';
import {
  DialogActions,
  DialogContent,
  FormHelperText,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AppealFieldsFragment } from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  AppealDocument,
  AppealQuery,
} from '../../AppealDetails/AppealsMainPanel/appealInfo.generated';
import { useUpdateAppealMutation } from './EditAppeal.generated';

interface EditAppealHeaderInfoModalProps {
  handleClose: () => void;
  appealInfo: AppealFieldsFragment;
}

export type EditAppealFormikSchema = {
  name: string;
  amount: number;
};

const EditAppealSchema: yup.SchemaOf<EditAppealFormikSchema> = yup.object({
  name: yup.string().required('Please enter a name'),
  amount: yup.number().required('Please enter a goal'),
});

export const EditAppealHeaderInfoModal: React.FC<
  EditAppealHeaderInfoModalProps
> = ({ appealInfo, handleClose }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [UpdateAppeal] = useUpdateAppealMutation();

  const onSubmit = async (attributes: EditAppealFormikSchema) => {
    await UpdateAppeal({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: appealInfo.id,
            name: attributes.name,
            amount: attributes.amount,
          },
        },
      },
      update: (cache) => {
        const query = {
          query: AppealDocument,
          variables: {
            accountListId: accountListId ?? '',
            appealId: appealInfo.id,
          },
        };
        const dataFromCache = cache.readQuery<AppealQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            appeal: {
              ...dataFromCache.appeal,
              name: attributes.name,
              amount: attributes.amount,
            },
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully updated the appeal'), {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(t('Failed to update the appeal'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Modal title={t('Edit Appeal')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          name: appealInfo.name,
          amount: appealInfo.amount ?? 0,
        }}
        validationSchema={EditAppealSchema}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          values: { name, amount },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box>
                <FieldWrapper>
                  <TextField
                    required
                    id="name"
                    label={t('Name')}
                    value={name}
                    disabled={isSubmitting}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={true}
                    onChange={handleChange}
                  />
                  <FormHelperText error={true} data-testid="nameError">
                    {errors.name && errors.name}
                  </FormHelperText>
                </FieldWrapper>
              </Box>
              <Box marginTop={4}>
                <FieldWrapper>
                  <TextField
                    required
                    id="amount"
                    label={t('Goal')}
                    value={amount}
                    type="number"
                    disabled={isSubmitting}
                    onChange={handleChange}
                  />
                  <FormHelperText error={true} data-testid="amountError">
                    {errors.amount && errors.amount}
                  </FormHelperText>
                </FieldWrapper>
              </Box>
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
