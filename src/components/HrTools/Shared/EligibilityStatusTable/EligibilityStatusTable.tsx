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
  styled,
  useTheme,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { getHousingKind } from 'src/components/Reports/Shared/HousingAllowance/housingAllowance';

const StyledTable = styled(Table)(({ theme }) => ({
  tableLayout: 'fixed',
  '.MuiTableCell-head': {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  '.MuiTableBody-root .MuiTableCell-root:first-of-type': {
    fontWeight: 'bold',
  },
}));

const MhiSectionRow = styled(TableRow)(({ theme }) => ({
  td: {
    borderTop: '2px solid',
    borderTopColor: theme.palette.divider,
  },
}));

interface EligibilityStatusTableProps {
  userPreferredName: string;
  userEligible: boolean;
  userCountry?: string | null;
  userMhiEligibility?: boolean;
  spousePreferredName?: string;
  spouseEligible?: boolean;
  spouseCountry?: string | null;
  spouseMhiEligibility?: boolean;
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
  if (getHousingKind(country) === 'MHI') {
    return t('Must complete an MHI form instead');
  }
  return t('Has not completed the required IBS courses');
};

const getMhiReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
): string => {
  if (getHousingKind(country) !== 'MHI') {
    return t('Not applicable');
  }
  return eligible
    ? t('Satisfies the IBS Exception for Italy staff')
    : t('Does not satisfy the IBS Exception for Italy staff');
};

export const EligibilityStatusTable: React.FC<EligibilityStatusTableProps> = ({
  userPreferredName,
  userEligible,
  userCountry,
  userMhiEligibility,
  spousePreferredName,
  spouseEligible,
  spouseCountry,
  spouseMhiEligibility,
  compact = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const hasSpouse = !!spousePreferredName;
  const anyIneligible =
    !userEligible || (hasSpouse && spouseEligible === false);
  const anyEligible = userEligible || (hasSpouse && spouseEligible === true);
  const showMhiRows =
    getHousingKind(userCountry ?? null) === 'MHI' ||
    getHousingKind(spouseCountry ?? null) === 'MHI';

  const content = (
    <>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell>{t('Category')}</TableCell>
            <TableCell>{userPreferredName}</TableCell>
            {hasSpouse && <TableCell>{spousePreferredName}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              {showMhiRows ? t('MHA Eligibility') : t('Eligibility')}
            </TableCell>
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
            <TableCell>{showMhiRows ? t('MHA Reason') : t('Reason')}</TableCell>
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
          {showMhiRows && (
            <>
              <MhiSectionRow>
                <TableCell>{t('MHI Eligibility')}</TableCell>
                <TableCell>
                  {getHousingKind(userCountry ?? null) === 'MHI'
                    ? userMhiEligibility
                      ? t('Eligible')
                      : t('Ineligible')
                    : t('Not applicable')}
                </TableCell>
                {hasSpouse && (
                  <TableCell>
                    {getHousingKind(spouseCountry ?? null) === 'MHI'
                      ? spouseMhiEligibility
                        ? t('Eligible')
                        : t('Ineligible')
                      : t('Not applicable')}
                  </TableCell>
                )}
              </MhiSectionRow>
              <TableRow>
                <TableCell>{t('MHI Reason')}</TableCell>
                <TableCell>
                  {getMhiReason(
                    t,
                    userMhiEligibility ?? false,
                    userCountry ?? null,
                  )}
                </TableCell>
                {hasSpouse && (
                  <TableCell>
                    {getMhiReason(
                      t,
                      spouseMhiEligibility ?? false,
                      spouseCountry ?? null,
                    )}
                  </TableCell>
                )}
              </TableRow>
            </>
          )}
        </TableBody>
      </StyledTable>
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
      {showMhiRows && (
        <Box
          sx={{ mt: compact ? theme.spacing(1) : theme.spacing(2) }}
          data-testid="mhi-paper-form-note"
        >
          <Typography
            variant="body2"
            fontStyle="italic"
            sx={{ lineHeight: 1.5 }}
          >
            <Trans t={t}>
              Note: Italy staff must complete a paper MHI form.
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
      <CardHeader
        title={
          showMhiRows
            ? t('MHA & MHI Eligibility Status')
            : t('MHA Eligibility Status')
        }
      />
      <CardContent>{content}</CardContent>
    </Card>
  );
};
