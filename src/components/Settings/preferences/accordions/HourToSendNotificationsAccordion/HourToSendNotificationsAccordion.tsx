import React, { ReactElement } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { useUpdateHourToSendNotificationsPreferenceMutation } from './UpdateHourToSendNotifications.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  GetPersonalPreferencesQuery,
  GetPersonalPreferencesDocument,
} from '../../GetPersonalPreferences.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

interface HourToSendNotificationsAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetPersonalPreferencesQuery['user'] | undefined;
  accountListId: string;
}

export const HourToSendNotificationsAccordion: React.FC<
  HourToSendNotificationsAccordionProps
> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateHourToSendNotificationsPreference] =
    useUpdateHourToSendNotificationsPreferenceMutation();
  const constants = useApiConstants();
  const hours = constants?.times ?? [];
  const label = 'Hour To Send Notifications';

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.Preference, 'hourToSendNotifications'>
  > = yup.object({
    hourToSendNotifications: yup.number().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.Preference, 'hourToSendNotifications'>,
  ) => {
    await updateHourToSendNotificationsPreference({
      variables: {
        input: {
          attributes: {
            hourToSendNotifications: attributes.hourToSendNotifications,
          },
        },
      },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetPersonalPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: {
                ...data.user,
                preferences: {
                  ...data.user.preferences,
                  hourToSendNotifications: attributes.hourToSendNotifications,
                },
              },
              accountList: data.accountList,
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
      value={
        hours.find(
          ({ key }) => key === data?.preferences?.hourToSendNotifications,
        )?.value || 'Immediately'
      }
      fullWidth={true}
    >
      <Formik
        initialValues={{
          hourToSendNotifications: data?.preferences?.hourToSendNotifications,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { hourToSendNotifications },
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
                labelText={t(label)}
                helperText={t(
                  'MPDX can send you app notifications immediately or at a particular time each day. Please make sure your time zone is set correctly so this time matches your local time.',
                )}
              >
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={hourToSendNotifications}
                  onChange={(_, value) => {
                    setFieldValue('hourToSendNotifications', value);
                  }}
                  options={hours.map((hour) => hour.key) || []}
                  getOptionLabel={(hourToSendNotifications): string =>
                    hours.find(({ key }) => key === hourToSendNotifications)
                      ?.value ?? ''
                  }
                  filterSelectedOptions
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} placeholder={t(label)} />
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
