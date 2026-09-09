import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/**
 * Names the fields a goal cannot be calculated without, beside Save & Share.
 * The required fields sit far up a long form, so turning them red is invisible
 * from the actions — this summary is the feedback the admin can actually see
 * when Save & Share refuses to submit.
 *
 * Held back until the first submit: Save & Share looks ordinary and stays
 * clickable, so nothing should accuse the admin of missing fields before they
 * have asked to save.
 */
export const GoalSettingsMissingFields: React.FC = () => {
  const { t } = useTranslation();
  const { errors, submitCount } = useFormikContext<GoalSettingsFormValues>();

  // Deduplicated because a married household reports the same rule per person.
  const messages = [
    ...new Set(Object.values(errors).filter((error) => !!error)),
  ] as string[];

  if (!submitCount || !messages.length) {
    return null;
  }

  return (
    // status, not alert: this updates as fields are filled in, so it should
    // not interrupt a screen reader mid-edit.
    <Alert role="status" severity="warning" sx={{ ul: { pl: 2, mb: 0 } }}>
      <AlertTitle sx={{ mb: 0.5 }}>
        {t('{{count}} field still needs a value', { count: messages.length })}
      </AlertTitle>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </Alert>
  );
};
