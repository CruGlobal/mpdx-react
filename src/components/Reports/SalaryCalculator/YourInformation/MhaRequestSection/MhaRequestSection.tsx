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
import { EligibilityStatusTable } from 'src/components/Reports/Shared/EligibilityStatusTable/EligibilityStatusTable';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
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
    anyIneligible,
    hasSpouse,
  } = useMhaRequestData();

  return (
    <StepCard
      sx={{
        '.MuiCardContent-root': {
          gap: theme.spacing(4),
        },
      }}
    >
      <CardHeader title={t('MHA Request')} />
      <CardContent>
        {anyIneligible && (
          <EligibilityStatusTable
            userPreferredName={userPreferredName}
            userEligible={userEligible}
            userCountry={userCountry}
            spousePreferredName={hasSpouse ? spousePreferredName : undefined}
            spouseEligible={hasSpouse ? spouseEligible : undefined}
            spouseCountry={hasSpouse ? spouseCountry : undefined}
            compact
          />
        )}

        {anyEligibleWithoutApprovedMha && (
          <Typography
            variant="body1"
            sx={{ marginBottom: theme.spacing(2) }}
            data-testid="no-mha-submit-message"
          >
            <Trans t={t}>
              Our records show that not all staff have a Minister&apos;s Housing
              Allowance for the effective date of this salary calculation. If an
              MHA Request form has not yet been submitted, it may be completed
              using{' '}
              <Link
                href={`/accountLists/${accountListId}/hrTools/mhaCalculator`}
              >
                this link
              </Link>
              . Pending MHA Requests will not apply to this salary calculation
              but a new Salary Calculation Form can be submitted after approval.
            </Trans>
          </Typography>
        )}

        {(showUserFields || showSpouseFields) && (
          <>
            <Typography variant="body1" data-testid="board-approved-amount">
              <strong>
                {showUserFields && showSpouseFields
                  ? t(
                      'You may request up to your Board-approved MHA amount of {{approvedAmount}} combined.',
                      { approvedAmount },
                    )
                  : showSpouseFields
                    ? t(
                        '{{name}} may request up to their Board Approved MHA Amount of {{approvedAmount}}.',
                        { name: spousePreferredName, approvedAmount },
                      )
                    : t(
                        'You may request up to your Board Approved MHA Amount of {{approvedAmount}}.',
                        { approvedAmount },
                      )}
              </strong>{' '}
              <Trans t={t}>
                This is the amount you are approved for as of the effective date
                of this salary calculation.
              </Trans>
            </Typography>
            <Typography variant="body1">
              <Trans t={t}>
                Please enter the amount of your salary you would like to request
                as MHA below. If you have a pending MHA Request for a new
                amount, it will not apply to this salary calculation but you can
                submit a new Salary Calculation Form after it is approved.
              </Trans>
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
                    label={t('Current MHA')}
                    size="small"
                    fullWidth
                    value={currentTakenAmount}
                    disabled
                    inputProps={{ 'data-testid': 'current-mha-staff' }}
                  />
                )}
                {showSpouseFields && (
                  <TextField
                    label={t('Current MHA')}
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
                    label={t('New Requested MHA')}
                    fieldName="mhaAmount"
                    schema={schema}
                    required
                  />
                )}
                {showSpouseFields && (
                  <AutosaveTextField
                    label={t('New Requested MHA')}
                    fieldName="spouseMhaAmount"
                    schema={schema}
                    required
                  />
                )}
              </SpouseLayout>
            </Stack>

            <Box>
              <StyledProgressHeaderBox>
                <Typography variant="body2">
                  {showUserFields && showSpouseFields
                    ? t('Combined MHA Requested')
                    : t('New MHA Requested')}
                </Typography>
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
                  {t('Remaining in approved MHA Amount')}
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
