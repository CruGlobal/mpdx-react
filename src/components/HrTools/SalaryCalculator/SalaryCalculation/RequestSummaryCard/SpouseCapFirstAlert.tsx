import React, { useEffect } from 'react';
import { Alert } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';

interface SpouseCapFirstAlertProps {
  overName: string | null;
  otherName: string | null;
  otherCap: string;
  manuallySplitCap: boolean;
  autoSplitCap: boolean;
}

export const SpouseCapFirstAlert: React.FC<SpouseCapFirstAlertProps> = ({
  overName,
  otherName,
  otherCap,
  manuallySplitCap,
  autoSplitCap,
}) => {
  const { t } = useTranslation();
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
        {{ other: otherName }}&apos;s Gross Requested Salary to{' '}
        {{ cap: otherCap }}, which brings them up to their Maximum Allowable
        Salary. After you have both reached your Maximum Allowable Salary, a
        higher request will go through our Progressive Approvals process.
      </Trans>
      {/* The cap shown on the page is lower than the amount, since it rises as the salary rises */}
      {autoSplitCap && (
        <>
          {' '}
          <Trans t={t}>
            Since your Combined Maximum Allowable Salary is split automatically,{' '}
            {{ other: otherName }}&apos;s Maximum Allowable Salary goes up as
            their salary goes up.
          </Trans>
        </>
      )}
      {manuallySplitCap &&
        ` ${t(
          'You can also change how you split your Combined Maximum Allowable Salary in the Your Information step.',
        )}`}
    </Alert>
  );
};
