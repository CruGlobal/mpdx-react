import React, { ReactElement } from 'react';
import { TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountList } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const accountPreferencesSchema: yup.ObjectSchema<Pick<AccountList, 'name'>> =
  yup.object({
    name: yup.string().required(),
  });

interface AccountNameAccordionProps {
  handleAccordionChange: (accordion: PreferenceAccordion | null) => void;
  expandedAccordion: PreferenceAccordion | null;
  accountListId: string;
  name: string;
  disabled?: boolean;
}

export const AccountNameAccordion: React.FC<AccountNameAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  name,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountNamePreference] = useUpdateAccountPreferencesMutation();
  const label = t('Account Name');

  const onSubmit = async (attributes: Pick<AccountList, 'name'>) => {
    await updateAccountNamePreference({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            name: attributes.name,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
        handleAccordionChange(null);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      accordion={PreferenceAccordion.AccountName}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={name}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          name: name,
        }}
        validationSchema={accountPreferencesSchema}
        onSubmit={onSubmit}
        validateOnMount
      >
        {({
          values: { name },
          errors,
          handleSubmit,
          isSubmitting,
          isValid,
          handleChange,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              helperText={t(
                'You can change the account name in {{appName}} into something that is more identifiable to you. This will not change the account name with your organization.',
                { appName },
              )}
            >
              <TextField
                value={name}
                onChange={handleChange}
                inputProps={{
                  'aria-label': label,
                }}
                error={!!errors.name}
                helperText={errors.name && t('Account Name is required')}
                name={'name'}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                label={label}
                sx={{ marginTop: 1 }}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
