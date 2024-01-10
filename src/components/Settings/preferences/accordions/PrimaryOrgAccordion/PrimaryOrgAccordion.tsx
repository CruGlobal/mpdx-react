import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { GetUsersOrganizationsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface PrimaryOrgAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  organizations: GetUsersOrganizationsQuery | undefined;
  salaryOrganizationId: string | null;
  accountListId: string;
}

export const PrimaryOrgAccordion: React.FC<PrimaryOrgAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  organizations,
  salaryOrganizationId,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();

  const label = t('Primary Organization');
  const orgs = organizations?.userOrganizationAccounts || [];

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountList, 'salaryOrganizationId'>
  > = yup.object({
    salaryOrganizationId: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountList, 'salaryOrganizationId'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            salaryOrganizationId: attributes.salaryOrganizationId || null,
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
      value={
        orgs.find(
          ({ organization }) =>
            String(organization.id) === String(salaryOrganizationId),
        )?.organization.name ?? ''
      }
      fullWidth
    >
      <Formik
        initialValues={{
          salaryOrganizationId: salaryOrganizationId,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { salaryOrganizationId },
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
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
                  'This should be the organization from which you are paid and most likely correspond to the country in which you are living and serving. This will set your currency conversions for multi-currency accounts to the currency of this organization both on the dashboard and the corresponding contribution reports.',
                )}
              >
                <Autocomplete
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={salaryOrganizationId}
                  onChange={(_, value) => {
                    setFieldValue('salaryOrganizationId', value);
                  }}
                  options={orgs.map((org) => org.organization.id) || []}
                  getOptionLabel={(salaryOrganizationId): string =>
                    orgs.find(
                      ({ organization }) =>
                        String(organization.id) ===
                        String(salaryOrganizationId),
                    )?.organization.name ?? ''
                  }
                  filterSelectedOptions
                  fullWidth
                  data-testid={'input' + label.replace(/\s/g, '')}
                  renderInput={(params) => (
                    <TextField {...params} placeholder={label} />
                  )}
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
