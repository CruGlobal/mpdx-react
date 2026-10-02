import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Link,
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
import { MinistersHousingIneligibilityReasonEnum } from 'src/graphql/types.generated';

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
  userIneligibilityReasonCode?: MinistersHousingIneligibilityReasonEnum | null;
  userMhiIneligibilityReasonCode?: MinistersHousingIneligibilityReasonEnum | null;
  spousePreferredName?: string;
  spouseEligible?: boolean;
  spouseCountry?: string | null;
  spouseMhiEligibility?: boolean;
  spouseIneligibilityReasonCode?: MinistersHousingIneligibilityReasonEnum | null;
  spouseMhiIneligibilityReasonCode?: MinistersHousingIneligibilityReasonEnum | null;
  compact?: boolean;
}

const getIneligibilityReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
  reasonCode: MinistersHousingIneligibilityReasonEnum | null,
): string => {
  if (eligible) {
    return t('Completed the required IBS courses');
  }
  const reasonCopy: Record<MinistersHousingIneligibilityReasonEnum, string> = {
    [MinistersHousingIneligibilityReasonEnum.PersonType]: t(
      'Staff type is not eligible for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.SupportType]: t(
      'Support type must be Supported RMO',
    ),
    [MinistersHousingIneligibilityReasonEnum.AssignmentStatus]: t(
      'Assignment status must be payroll eligible',
    ),
    [MinistersHousingIneligibilityReasonEnum.ItalyMhi]: t(
      'Must complete an MHI form instead',
    ),
    // Unreachable in MHA results (the MHA country check only fails for Italy)
    [MinistersHousingIneligibilityReasonEnum.NonItalyMha]: t('Not applicable'),
    [MinistersHousingIneligibilityReasonEnum.NoIbsCertification]: t(
      'Has not completed the required IBS courses',
    ),
    [MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification]: t(
      'IBS certification type is not valid for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired]: t(
      'IBS certification is more than 10 years old',
    ),
    [MinistersHousingIneligibilityReasonEnum.MissingIbsCertificationDate]: t(
      'IBS certification date is missing from your records',
    ),
  };
  // Fall back to the country-based guess when the API predates the reason code
  // (null) or sends a code newer than this client (missing from the record)
  const fallbackCode =
    getHousingKind(country) === 'MHI'
      ? MinistersHousingIneligibilityReasonEnum.ItalyMhi
      : MinistersHousingIneligibilityReasonEnum.NoIbsCertification;
  return reasonCopy[reasonCode ?? fallbackCode] ?? reasonCopy[fallbackCode];
};

const getMhiReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
  reasonCode: MinistersHousingIneligibilityReasonEnum | null,
): string => {
  if (getHousingKind(country) !== 'MHI') {
    return t('Not applicable');
  }
  if (eligible) {
    return t('Satisfies the IBS Exception for Italy staff');
  }
  const exceptionNotSatisfied = t(
    'Does not satisfy the IBS Exception for Italy staff',
  );
  const reasonCopy: Record<MinistersHousingIneligibilityReasonEnum, string> = {
    [MinistersHousingIneligibilityReasonEnum.PersonType]: t(
      'Staff type is not eligible for MHI',
    ),
    [MinistersHousingIneligibilityReasonEnum.SupportType]: t(
      'Support type must be Supported RMO',
    ),
    [MinistersHousingIneligibilityReasonEnum.AssignmentStatus]: t(
      'Assignment status must be payroll eligible',
    ),
    // Every certification-family failure means the Italy exception is not met
    [MinistersHousingIneligibilityReasonEnum.NoIbsCertification]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.MissingIbsCertificationDate]:
      exceptionNotSatisfied,
    // Unreachable in MHI results: Italy staff pass the MHI country check
    [MinistersHousingIneligibilityReasonEnum.ItalyMhi]: exceptionNotSatisfied,
    // Unreachable here: the country gate above already returned Not applicable
    [MinistersHousingIneligibilityReasonEnum.NonItalyMha]: t('Not applicable'),
  };
  const fallbackCode =
    MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification;
  return reasonCopy[reasonCode ?? fallbackCode] ?? reasonCopy[fallbackCode];
};

export const EligibilityStatusTable: React.FC<EligibilityStatusTableProps> = ({
  userPreferredName,
  userEligible,
  userCountry,
  userMhiEligibility,
  userIneligibilityReasonCode,
  userMhiIneligibilityReasonCode,
  spousePreferredName,
  spouseEligible,
  spouseCountry,
  spouseMhiEligibility,
  spouseIneligibilityReasonCode,
  spouseMhiIneligibilityReasonCode,
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
              {getIneligibilityReason(
                t,
                userEligible,
                userCountry ?? null,
                userIneligibilityReasonCode ?? null,
              )}
            </TableCell>
            {hasSpouse && (
              <TableCell>
                {getIneligibilityReason(
                  t,
                  spouseEligible ?? false,
                  spouseCountry ?? null,
                  spouseIneligibilityReasonCode ?? null,
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
                    userMhiIneligibilityReasonCode ?? null,
                  )}
                </TableCell>
                {hasSpouse && (
                  <TableCell>
                    {getMhiReason(
                      t,
                      spouseMhiEligibility ?? false,
                      spouseCountry ?? null,
                      spouseMhiIneligibilityReasonCode ?? null,
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
              <Link href="tel:4078262230">(407) 826-2230</Link> or{' '}
              <Link href="mailto:MHA@cru.org">MHA@cru.org</Link>.
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
