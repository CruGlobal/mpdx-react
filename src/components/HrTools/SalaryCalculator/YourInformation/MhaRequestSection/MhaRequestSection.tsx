import Link from 'next/link';
import React from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  LinearProgress,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import { Trans, useTranslation } from 'react-i18next';
import { EligibilityStatusTable } from 'src/components/HrTools/Shared/EligibilityStatusTable/EligibilityStatusTable';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { EffectiveDateNote } from '../../Shared/EffectiveDateNote';
import { StepCard } from '../../Shared/StepCard';
import { useMhaRequestData } from './useMhaRequestData';

const SpouseLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const StyledProgressHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const StyledRemainingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

export const MhaRequestSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const accountListId = useAccountListId();
  const { hcmUser, hcmSpouse } = useSalaryCalculator();
  const {
    schema,
    totalRequestedMhaValue,
    difference,
    approvedAmount,
    progressPercentage,
    currentTakenAmount,
    currentSpouseTakenAmount,
    anyEligibleWithoutApprovedMha,
    showUserFields,
    showSpouseFields,
    spousePreferredName,
    userPreferredName,
    userEligible,
    spouseEligible,
    userCountry,
    spouseCountry,
    userKind,
    spouseKind,
    userMhiEligibility,
    spouseMhiEligibility,
    anyIneligible,
    hasSpouse,
  } = useMhaRequestData();

  // Section-level copy follows the primary user's kind, except when only the
  // spouse's fields show — then it follows the spouse's kind so an MHI-only
  // spouse on a mixed-country couple gets MHI wording.
  const sectionKind =
    showSpouseFields && !showUserFields ? spouseKind : userKind;

  const boardApprovedText = () => {
    if (showUserFields && showSpouseFields) {
      return t(
        'You may request up to your Board-approved {{sectionKind}} amount of {{approvedAmount}} combined.',
        { sectionKind, approvedAmount },
      );
    }
    if (showSpouseFields) {
      return t(
        '{{name}} may request up to their Board Approved {{sectionKind}} Amount of {{approvedAmount}}.',
        { name: spousePreferredName, sectionKind, approvedAmount },
      );
    }
    return t(
      'You may request up to your Board Approved {{sectionKind}} Amount of {{approvedAmount}}.',
      { sectionKind, approvedAmount },
    );
  };

  const progressHeaderText = () => {
    if (showUserFields && showSpouseFields) {
      return t('Combined {{sectionKind}} Requested', { sectionKind });
    }
    return t('New {{sectionKind}} Requested', { sectionKind });
  };

  return (
    <StepCard
      sx={{
        '.MuiCardContent-root': {
          gap: theme.spacing(4),
        },
      }}
    >
      <CardHeader
        title={t('{{sectionKind}} Request', { sectionKind })}
        subheader={<EffectiveDateNote />}
      />
      <CardContent>
        {anyIneligible && (
          <EligibilityStatusTable
            userPreferredName={userPreferredName}
            userEligible={userEligible}
            userCountry={userCountry}
            userMhiEligibility={userMhiEligibility}
            spousePreferredName={hasSpouse ? spousePreferredName : undefined}
            spouseEligible={hasSpouse ? spouseEligible : undefined}
            spouseCountry={hasSpouse ? spouseCountry : undefined}
            spouseMhiEligibility={hasSpouse ? spouseMhiEligibility : undefined}
            compact
          />
        )}

        {anyEligibleWithoutApprovedMha && (
          <Typography
            variant="body1"
            sx={{ marginBottom: theme.spacing(2) }}
            data-testid="no-mha-submit-message"
          >
            {sectionKind === 'MHI' ? (
              <Trans t={t}>
                Our records show that not all staff have an MHI for the
                effective date of this salary calculation. To apply for MHI,
                contact Personnel Records at{' '}
                <a href="tel:4078262230">(407) 826-2230</a> or{' '}
                <a href="mailto:MHA@cru.org">MHA@cru.org</a>. Pending MHI
                Requests will not apply to this salary calculation but a new
                Salary Calculation Form can be submitted after approval.
              </Trans>
            ) : (
              <Trans t={t}>
                Our records show that not all staff have a Minister&apos;s
                Housing Allowance for the effective date of this salary
                calculation. If an MHA Request form has not yet been submitted,
                it may be completed using{' '}
                <Link
                  href={`/accountLists/${accountListId}/hrTools/mhaCalculator`}
                >
                  this link
                </Link>
                . Pending MHA Requests will not apply to this salary calculation
                but a new Salary Calculation Form can be submitted after
                approval.
              </Trans>
            )}
          </Typography>
        )}

        {(showUserFields || showSpouseFields) && (
          <>
            <Typography variant="body1" data-testid="board-approved-amount">
              <strong>{boardApprovedText()}</strong>{' '}
              <Trans t={t}>
                This is the amount you are approved for as of the effective date
                of this salary calculation.
              </Trans>
            </Typography>
            <Typography variant="body1">
              {t(
                'Please enter the amount of your salary you would like to request as {{sectionKind}} below. If you have a pending {{sectionKind}} Request for a new amount, it will not apply to this salary calculation but you can submit a new Salary Calculation Form after it is approved.',
                { sectionKind },
              )}
            </Typography>
          </>
        )}

        {(showUserFields || showSpouseFields) && (
          <>
            {showUserFields && showSpouseFields && (
              <SpouseLayout>
                <Typography variant="subtitle1" flex={1}>
                  {hcmUser?.staffInfo.preferredName}
                </Typography>
                <Typography variant="subtitle1" flex={1}>
                  {hcmSpouse?.staffInfo.preferredName}
                </Typography>
              </SpouseLayout>
            )}
            {!showUserFields && showSpouseFields && (
              <Typography variant="subtitle1">
                {hcmSpouse?.staffInfo.preferredName}
              </Typography>
            )}

            <Stack gap={3}>
              <SpouseLayout>
                {showUserFields && (
                  <TextField
                    label={t('Current {{kind}}', { kind: userKind })}
                    size="small"
                    fullWidth
                    value={currentTakenAmount}
                    disabled
                    inputProps={{ 'data-testid': 'current-mha-staff' }}
                  />
                )}
                {showSpouseFields && (
                  <TextField
                    label={t('Current {{kind}}', { kind: spouseKind })}
                    size="small"
                    fullWidth
                    value={currentSpouseTakenAmount}
                    disabled
                    inputProps={{ 'data-testid': 'current-mha-spouse' }}
                  />
                )}
              </SpouseLayout>
              <SpouseLayout>
                {showUserFields && (
                  <AutosaveTextField
                    label={t('New Requested {{kind}}', { kind: userKind })}
                    fieldName="mhaAmount"
                    schema={schema}
                    required
                  />
                )}
                {showSpouseFields && (
                  <AutosaveTextField
                    label={t('New Requested {{kind}}', { kind: spouseKind })}
                    fieldName="spouseMhaAmount"
                    schema={schema}
                    required
                  />
                )}
              </SpouseLayout>
            </Stack>

            <Box>
              <StyledProgressHeaderBox>
                <Typography variant="body2">{progressHeaderText()}</Typography>
                <Typography variant="body2">
                  {totalRequestedMhaValue} / {approvedAmount}
                </Typography>
              </StyledProgressHeaderBox>
              <LinearProgress
                value={progressPercentage}
                variant="determinate"
                color="success"
              />
              <StyledRemainingBox>
                <Typography variant="body2" color="textSecondary">
                  {t('Remaining in approved {{sectionKind}} Amount', {
                    sectionKind,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {difference}
                </Typography>
              </StyledRemainingBox>
            </Box>
          </>
        )}
      </CardContent>
    </StepCard>
  );
};
