import React, { useEffect } from 'react';
import { Alert } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { useSpouseCapFirst } from '../useSpouseCapFirst';

export const SpouseCapFirstAlert: React.FC = () => {
  const { t } = useTranslation();
  const { overName, otherName, otherCap, manuallySplitCap } =
    useSpouseCapFirst();
  const { markValid, markInvalid } = useOptionalAutosaveForm() ?? {};

  // Disable Continue and Submit while this shows, since the server refuses the request.
  useEffect(() => {
    markInvalid?.('spouse-cap-first');
    return () => markValid?.('spouse-cap-first');
  }, [markValid, markInvalid]);

  return (
    <Alert severity="error" data-testid="SpouseCapFirstAlert">
      <Trans t={t}>
        Your Combined Gross Requested Salary is within your Combined Maximum
        Allowable Salary, but {{ over: overName }}&apos;s Gross Requested Salary
        exceeds their individual Maximum Allowable Salary. Before either of you
        can request more than your own Maximum Allowable Salary, please raise{' '}
        {{ other: otherName }}&apos;s Requested Salary up to their Maximum
        Allowable Salary of {{ cap: otherCap }}. After you have both reached
        your Maximum Allowable Salary, a higher request will go through our
        Progressive Approvals process.
      </Trans>
      {manuallySplitCap &&
        ` ${t(
          'You can also change how you split your Combined Maximum Allowable Salary in the Your Information step.',
        )}`}
    </Alert>
  );
};
