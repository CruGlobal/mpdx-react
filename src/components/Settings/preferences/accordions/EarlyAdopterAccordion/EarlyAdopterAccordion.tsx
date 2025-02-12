import React, { ReactElement } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const accountPreferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'tester'>
> = yup.object({
  tester: yup.boolean().required(),
});

interface EarlyAdopterAccordionProps {
  handleAccordionChange: (accordion: PreferenceAccordion | null) => void;
  expandedAccordion: PreferenceAccordion | null;
  tester: boolean;
  accountListId: string;
  disabled?: boolean;
}

export const EarlyAdopterAccordion: React.FC<EarlyAdopterAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  tester,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = t('Early Adopter');

  const onSubmit = async (
    attributes: Pick<AccountListSettingsInput, 'tester'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: { tester: attributes.tester },
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
      accordion={PreferenceAccordion.EarlyAdopter}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={tester ? t('Yes') : t('No')}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          tester: tester,
        }}
        validationSchema={accountPreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({
          values: { tester },
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
                `By checking this box, you are telling us that you'd like to test new features for bugs before they are rolled out to the full {{appName}} user base. We'll send you an email when new features are available on your account to test, and then ask for you to give us feedback - both if you experience bugs and also about your thoughts about the feature(s) you are testing.`,
                { appName },
              )}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleChange}
                      name="tester"
                      checked={tester}
                      value={tester}
                      inputProps={{
                        'aria-label': label,
                      }}
                    />
                  }
                  label={label}
                />
              </FormGroup>
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
