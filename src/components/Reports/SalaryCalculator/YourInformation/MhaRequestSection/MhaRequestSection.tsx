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
import { Trans, useTranslation } from 'react-i18next';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../../Shared/StepCard';
import { NoMhaSubmitMessage } from './NoMhaSubmitMessage';
import { useMhaRequestData } from './useMhaRequestData';

const StyledNameHeadersBox = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(1),
}));

const StyledFieldGridBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasSpouse',
})<{ hasSpouse?: boolean }>(({ theme, hasSpouse }) => ({
  display: 'grid',
  gridTemplateColumns: hasSpouse ? '1fr 1fr' : '1fr',
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
  const { hcmUser, hcmSpouse } = useSalaryCalculator();
  const {
    schema,
    totalRequestedMhaValue,
    difference,
    approvedAmount,
    progressPercentage,
    currentTakenAmount,
    currentSpouseTakenAmount,
    showNoMhaMessage,
    isNoMhaPlural,
    noMhaNames,
    ineligibleName,
    showUserFields,
    showSpouseFields,
    spousePreferredName,
    showIneligibleMessage,
    isIneligiblePlural,
    ineligibleNames,
  } = useMhaRequestData();

  return (
    <StepCard>
      <CardHeader title={t('MHA Request')} />
      <CardContent>
        {showNoMhaMessage && !showUserFields && !showSpouseFields && (
          <NoMhaSubmitMessage
            isPlural={isNoMhaPlural}
            names={noMhaNames}
            showIneligibleMessage={showIneligibleMessage}
            isIneligiblePlural={isIneligiblePlural}
            ineligibleNames={ineligibleNames}
          />
        )}

        {(showUserFields || showSpouseFields) && (
          <>
            <Typography
              variant="body1"
              sx={{ marginBottom: theme.spacing(3) }}
              data-testid="board-approved-amount"
            >
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
              {ineligibleName && (
                <Trans t={t}>
                  {{ name: ineligibleName }} has not completed the required IBS
                  courses to meet eligibility criteria. For information about
                  obtaining eligibility, contact Personnel Records at
                  407-826-2252 or <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
                </Trans>
              )}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: theme.spacing(3) }}>
              <Trans t={t}>
                Please enter the amount of your salary you would like to request
                as MHA below. If you have a pending MHA Request for a new
                amount, it will not apply to this salary calculation but you can
                submit a new Salary Calculation Form after it is approved.
              </Trans>
            </Typography>

            {showNoMhaMessage && (
              <NoMhaSubmitMessage
                isPlural={isNoMhaPlural}
                names={noMhaNames}
                showIneligibleMessage={showIneligibleMessage}
                isIneligiblePlural={isIneligiblePlural}
                ineligibleNames={ineligibleNames}
              />
            )}
          </>
        )}

        {(showUserFields || showSpouseFields) && (
          <>
            {showUserFields && showSpouseFields && (
              <StyledNameHeadersBox>
                <Typography variant="subtitle1">
                  {hcmUser?.staffInfo.preferredName}
                </Typography>
                <Typography variant="subtitle1">
                  {hcmSpouse?.staffInfo.preferredName}
                </Typography>
              </StyledNameHeadersBox>
            )}
            {!showUserFields && showSpouseFields && (
              <Typography
                variant="subtitle1"
                sx={{
                  marginTop: theme.spacing(4),
                  marginBottom: theme.spacing(1),
                }}
              >
                {hcmSpouse?.staffInfo.preferredName}
              </Typography>
            )}

            <Box sx={{ marginBottom: theme.spacing(2) }}>
              <StyledFieldGridBox
                hasSpouse={showUserFields && showSpouseFields}
              >
                {showUserFields && (
                  <Box>
                    <TextField
                      label={t('Current MHA')}
                      size="small"
                      fullWidth
                      value={currentTakenAmount}
                      disabled
                      inputProps={{ 'data-testid': 'current-mha-staff' }}
                    />
                  </Box>
                )}
                {showSpouseFields && (
                  <Box>
                    <TextField
                      label={t('Current MHA')}
                      size="small"
                      fullWidth
                      value={currentSpouseTakenAmount}
                      disabled
                      inputProps={{ 'data-testid': 'current-mha-spouse' }}
                    />
                  </Box>
                )}
              </StyledFieldGridBox>
            </Box>

            <Box sx={{ marginBottom: theme.spacing(3) }}>
              <StyledFieldGridBox
                hasSpouse={showUserFields && showSpouseFields}
              >
                {showUserFields && (
                  <Box>
                    <AutosaveTextField
                      label={t('New Requested MHA')}
                      fieldName="mhaAmount"
                      schema={schema}
                      required
                    />
                  </Box>
                )}
                {showSpouseFields && (
                  <Box>
                    <AutosaveTextField
                      label={t('New Requested MHA')}
                      fieldName="spouseMhaAmount"
                      schema={schema}
                      required
                    />
                  </Box>
                )}
              </StyledFieldGridBox>
            </Box>

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
