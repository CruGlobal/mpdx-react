import React, { ReactElement, useMemo } from 'react';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SettingsOrganizationFragment } from 'pages/accountLists/[accountListId]/settings/organizations.generated';
import { GetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { OrganizationAutocomplete } from 'src/components/common/Autocomplete/OrganizationAutocomplete/OrganizationAutocomplete';
import { AccountList } from 'src/graphql/types.generated';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const preferencesSchema: yup.ObjectSchema<
  Pick<AccountList, 'salaryOrganizationId'>
> = yup.object({
  salaryOrganizationId: yup.string().required(),
});

interface PrimaryOrgAccordionProps extends AccordionProps<PreferenceAccordion> {
  organizations: GetUsersOrganizationsAccountsQuery | undefined;
  salaryOrganizationId: string;
  accountListId: string;
  disabled?: boolean;
}

export const PrimaryOrgAccordion: React.FC<PrimaryOrgAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  organizations,
  salaryOrganizationId,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();

  const label = t('Primary Organization');
  const orgs = organizations?.userOrganizationAccounts || [];
  const selectedOrgName = useMemo(() => {
    return (
      orgs.find(({ organization }) => organization.id === salaryOrganizationId)
        ?.organization.name ?? ''
    );
  }, [orgs, salaryOrganizationId]);

  const onSubmit = async (
    attributes: Pick<AccountList, 'salaryOrganizationId'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            salaryOrganizationId: attributes.salaryOrganizationId,
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
      accordion={PreferenceAccordion.PrimaryOrg}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedOrgName}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          salaryOrganizationId: salaryOrganizationId,
        }}
        validationSchema={preferencesSchema}
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
            <FieldWrapper
              labelText={label}
              helperText={t(
                'This should be the organization from which you are paid and most likely correspond to the country in which you are living and serving. This will set your currency conversions for multi-currency accounts to the currency of this organization both on the dashboard and the corresponding contribution reports.',
              )}
            >
              <OrganizationAutocomplete
                disabled={isSubmitting}
                autoHighlight
                organizations={orgs.map((org) => org.organization) || []}
                value={
                  orgs.find(
                    ({ organization }) =>
                      organization.id === salaryOrganizationId,
                  )?.organization as SettingsOrganizationFragment
                }
                onChange={(_, value) => {
                  setFieldValue('salaryOrganizationId', value?.id);
                }}
                fullWidth
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
