import React, { ReactElement } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { useUpdateAccountNamePreferenceMutation } from './UpdateAccountName.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  GetAccountPreferencesQuery,
  GetAccountPreferencesDocument,
} from '../../GetAccountPreferences.generated';

interface AccountNameAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetAccountPreferencesQuery | undefined;
  accountListId: string;
}

export const AccountNameAccordion: React.FC<AccountNameAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountNamePreference] =
    useUpdateAccountNamePreferenceMutation();
  const label = 'Account Name';

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
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetAccountPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: data.user,
              accountList: {
                ...data.accountList,
                name: attributes.name,
              },
              accountLists: data.accountLists,
            };
          },
        );
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
      label={t(label)}
      value={data?.accountList?.name || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          name: data?.accountList?.name || '',
        }}
        validationSchema={AccountPreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { name },
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
                labelText={t(label)}
                helperText={t(
                  'You can change the account name in MPDX into something that is more identifiable to you. This will not change the account name with your organization.',
                )}
              >
                <TextField
                  value={name}
                  onChange={handleChange('name')}
                  inputProps={{ 'aria-label': t('Account Name') }}
                  // error={!!errors.lastName}
                  // helperText={errors.lastName && t('Account Name is required')}
                  required
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
