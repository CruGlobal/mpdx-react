import React, { ReactElement } from 'react';
import { TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface AccountNameAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  accountListId: string;
  name: string;
}

export const AccountNameAccordion: React.FC<AccountNameAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  name,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountNamePreference] = useUpdateAccountPreferencesMutation();
  const label = t('Account Name');

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountList, 'name'>
  > = yup.object({
    name: yup.string().required(),
  });

  const onSubmit = async (attributes: Pick<Types.AccountList, 'name'>) => {
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
        //console.log('error: ', e);
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
        validationSchema={AccountPreferencesSchema}
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
            {loading && <Skeleton height="90px" />}
            {!loading && (
              <FieldWrapper
                labelText={label}
                helperText={t(
                  'You can change the account name in {{appName}} into something that is more identifiable to you. This will not change the account name with your organization.',
                  { appName },
                )}
              >
                <TextField
                  value={name}
                  onChange={handleChange('name')}
                  inputProps={{
                    'aria-label': label,
                  }}
                  data-testid={'input' + label.replace(/\s/g, '')}
                  error={!!errors.name}
                  helperText={errors.name && t('Account Name is required')}
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
