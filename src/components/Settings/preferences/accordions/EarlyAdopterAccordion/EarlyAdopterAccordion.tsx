import React, { ReactElement } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface EarlyAdopterAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  tester: boolean;
  accountListId: string;
}

export const EarlyAdopterAccordion: React.FC<EarlyAdopterAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  tester,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { userID } = useRequiredSession();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = t('Early Adopter');

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'tester'>
  > = yup.object({
    tester: yup.boolean().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'tester'>,
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
        handleAccordionChange(label);

        if (!attributes.tester) {
          enqueueSnackbar(
            t('Redirecting you back to the old MPDx application.'),
            {
              variant: 'success',
            },
          );

          const url = new URL(
            `${process.env.SITE_URL || window.location.origin}/api/handoff`,
          );
          url.searchParams.append('accountListId', accountListId ?? '');
          url.searchParams.append('userId', userID);
          url.searchParams.append('path', '/preferences/personal');

          window.location.href = url.toString();
        }
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
      value={tester ? t('Yes') : t('No')}
      fullWidth
    >
      <Formik
        initialValues={{
          tester: tester,
        }}
        validationSchema={AccountPreferencesSchema}
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
