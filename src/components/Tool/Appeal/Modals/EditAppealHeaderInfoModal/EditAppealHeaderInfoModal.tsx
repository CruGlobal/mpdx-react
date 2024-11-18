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
import i18n from 'src/lib/i18n';
import { useUpdateAppealMutation } from './EditAppeal.generated';

interface EditAppealHeaderInfoModalProps {
  handleClose: () => void;
  appealInfo: AppealFieldsFragment;
}

export type EditAppealFormikSchema = {
  name: string;
  amount: number;
};

const EditAppealSchema: yup.ObjectSchema<EditAppealFormikSchema> = yup.object({
  name: yup.string().required(i18n.t('Please enter a name')),
  amount: yup
    .number()
    .required(i18n.t('Please enter a goal'))
    .typeError(i18n.t('Appeal amount must be a valid number'))
    .test(
      i18n.t('Is positive?'),
      i18n.t('Must use a positive number for appeal amount'),
      (value) => !value || parseFloat(value as unknown as string) > 0,
    ),
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
        cache.modify({
          id: cache.identify({ __typename: 'Appeal', id: appealInfo.id }),
          fields: {
            name() {
              return attributes.name;
            },
            amount() {
              return attributes.amount;
            },
          },
        });
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
                    {errors.name}
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
                    {errors.amount}
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
