import React, { ReactElement } from 'react';
import { TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountList } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const accountPreferencesSchema: yup.SchemaOf<Pick<AccountList, 'name'>> =
  yup.object({
    name: yup.string().required(),
  });

interface AccountNameAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  accountListId: string;
  name: string;
}

export const AccountNameAccordion: React.FC<AccountNameAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  name,
  accountListId,
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
        handleAccordionChange(label);
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
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={name}
      fullWidth
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
