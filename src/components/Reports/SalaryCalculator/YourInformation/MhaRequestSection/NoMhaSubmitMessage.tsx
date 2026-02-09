import Link from 'next/link';
import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface NoMhaSubmitMessageProps {
  isPlural: boolean;
  names: string;
  showIneligibleMessage?: boolean;
  isIneligiblePlural?: boolean;
  ineligibleNames?: string;
}

export const NoMhaSubmitMessage: React.FC<NoMhaSubmitMessageProps> = ({
  isPlural,
  names,
  showIneligibleMessage,
  isIneligiblePlural,
  ineligibleNames,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const accountListId = useAccountListId();

  return (
    <>
      {showIneligibleMessage && ineligibleNames && (
        <Typography
          variant="body1"
          sx={{ marginBottom: theme.spacing(2) }}
          data-testid="ineligible-message"
        >
          {t(
            isIneligiblePlural
              ? '{{names}} have not completed the required IBS courses to meet eligibility criteria. For information about obtaining eligibility, contact Personnel Records at 407-826-2252 or'
              : '{{names}} has not completed the required IBS courses to meet eligibility criteria. For information about obtaining eligibility, contact Personnel Records at 407-826-2252 or',
            { names: ineligibleNames },
          )}{' '}
          <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
        </Typography>
      )}
      <Typography
        variant="body1"
        sx={{ marginBottom: theme.spacing(2) }}
        data-testid="no-mha-submit-message"
      >
        <Trans t={t} values={{ names }}>
          {isPlural
            ? `Our records show that {{names}} do not have a Minister's Housing Allowance for the effective date of this salary calculation. If {{names}} have not yet submitted an MHA Request form, it may be completed at their earliest convenience using `
            : `Our records show that {{names}} does not have a Minister's Housing Allowance for the effective date of this salary calculation. If {{names}} has not yet submitted an MHA Request form, it may be completed at their earliest convenience using `}
          <Link
            href={`/accountLists/${accountListId}/reports/housingAllowance`}
          >
            this link.
          </Link>
        </Trans>
      </Typography>
      <Typography
        variant="body1"
        sx={{ marginBottom: theme.spacing(2) }}
        data-testid="no-mha-pending-message"
      >
        <Trans t={t} values={{ names }}>
          {isPlural
            ? 'If {{names}} have a pending MHA Request, it will not apply to this salary calculation but a new Salary Calculation Form can be submitted after it is approved.'
            : 'If {{names}} has a pending MHA Request, it will not apply to this salary calculation but a new Salary Calculation Form can be submitted after it is approved.'}
        </Trans>
      </Typography>
    </>
  );
};
