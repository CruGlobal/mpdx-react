import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

interface EligibilityStatusTableProps {
  userPreferredName: string;
  userEligible: boolean;
  userCountry?: string | null;
  spousePreferredName?: string;
  spouseEligible?: boolean;
  spouseCountry?: string | null;
  compact?: boolean;
}

const getIneligibilityReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
): string => {
  if (eligible) {
    return t('Completed the required IBS courses');
  }
  if (country === 'IT') {
    return t('Must complete an MHI form instead');
  }
  return t('Has not completed the required IBS courses');
};

export const EligibilityStatusTable: React.FC<EligibilityStatusTableProps> = ({
  userPreferredName,
  userEligible,
  userCountry,
  spousePreferredName,
  spouseEligible,
  spouseCountry,
  compact = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const hasSpouse = !!spousePreferredName;
  const anyIneligible =
    !userEligible || (hasSpouse && spouseEligible === false);
  const anyEligible = userEligible || (hasSpouse && spouseEligible === true);

  const content = (
    <>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('Category')}</TableCell>
            <TableCell>{userPreferredName}</TableCell>
            {hasSpouse && <TableCell>{spousePreferredName}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{t('Eligibility')}</TableCell>
            <TableCell>
              {userEligible ? t('Eligible') : t('Ineligible')}
            </TableCell>
            {hasSpouse && (
              <TableCell>
                {spouseEligible ? t('Eligible') : t('Ineligible')}
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            <TableCell>{t('Reason')}</TableCell>
            <TableCell>
              {getIneligibilityReason(t, userEligible, userCountry ?? null)}
            </TableCell>
            {hasSpouse && (
              <TableCell>
                {getIneligibilityReason(
                  t,
                  spouseEligible ?? false,
                  spouseCountry ?? null,
                )}
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
      {anyIneligible && (
        <Box
          sx={{ mt: compact ? 0 : theme.spacing(2) }}
          data-testid="eligibility-contact-info"
        >
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {anyEligible && (
              <Trans t={t}>
                Any changes will only apply to the approved staff member.
              </Trans>
            )}{' '}
            <Trans t={t}>
              Once approved, when you calculate your salary, you will see the
              approved amount that can be applied to your salary. If you believe
              this is incorrect, or would like to complete the required IBS
              courses, please contact Personnel Records at{' '}
              <a href="tel:4078262230">(407) 826-2230</a> or{' '}
              <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
            </Trans>
          </Typography>
        </Box>
      )}
    </>
  );

  if (compact) {
    return content;
  }

  return (
    <Card data-testid="eligibility-status-table">
      <CardHeader title={t('MHA Eligibility Status')} />
      <CardContent>{content}</CardContent>
    </Card>
  );
};
