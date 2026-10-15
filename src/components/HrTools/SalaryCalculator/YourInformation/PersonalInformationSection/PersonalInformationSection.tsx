import React, { useMemo } from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  CircularProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import {
  GEOGRAPHIC_LOCATION_NONE,
  useGoalCalculatorConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { AutosaveAutocomplete } from '../../Autosave/AutosaveAutocomplete';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { EffectiveDateNote } from '../../Shared/EffectiveDateNote';
import { StepCard, StepTableHead } from '../../Shared/StepCard';
import { usePersonalInformation } from './usePersonalInformation';

export const PersonalInformationSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hcmUser, hcmSpouse, hcmLoading } = useSalaryCalculator();
  // A refetch also sets hcmLoading, so only cover the table before the first HCM result
  const awaitingHcm = hcmLoading && !hcmUser;
  const {
    selfTenure,
    spouseTenure,
    selfAge,
    spouseAge,
    selfChildren,
    spouseChildren,
  } = usePersonalInformation();
  const { goalGeographicConstantMap } = useGoalCalculatorConstants();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  return (
    <StepCard>
      <CardHeader
        title={t('Personal Information')}
        subheader={<EffectiveDateNote />}
        data-testid="personal-information-header"
      />
      <CardContent>
        <Typography variant="body1">
          {t(
            'Your Maximum Allowable Salary (CAP) is based on the following information:',
          )}
        </Typography>
        <Box position="relative">
          {awaitingHcm && (
            <Box
              position="absolute"
              zIndex={1}
              sx={{
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <CircularProgress
                aria-label={t('Loading personal information')}
              />
            </Box>
          )}
          <Table aria-busy={awaitingHcm}>
            <StepTableHead />
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography>
                    {t('Nearest Geographic Multiplier Location')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t(
                      'If you live within 50 miles of one of the following metropolitan areas, please select it from the list. If not, select "None."',
                    )}
                  </Typography>
                </TableCell>
                <TableCell colSpan={hcmSpouse ? 2 : 1}>
                  <AutosaveAutocomplete
                    label={t('Nearest Geographic Multiplier Location')}
                    fieldName="location"
                    options={locations}
                    emptyValue={GEOGRAPHIC_LOCATION_NONE}
                    // The overlay only blocks the mouse, so keep keyboard users out too
                    disabled={awaitingHcm}
                    textFieldProps={{
                      InputLabelProps: {
                        sx: { fontSize: theme.typography.body2.fontSize },
                      },
                      InputProps: {
                        sx: { fontSize: theme.typography.body2.fontSize },
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Tenure')}</TableCell>
                <TableCell>{selfTenure}</TableCell>
                {hcmSpouse && <TableCell>{spouseTenure}</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>{t('Age')}</TableCell>
                <TableCell>{selfAge}</TableCell>
                {hcmSpouse && <TableCell>{spouseAge}</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>{t('Children')}</TableCell>
                <TableCell>{selfChildren}</TableCell>
                {hcmSpouse && <TableCell>{spouseChildren}</TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Typography
          variant="body2"
          paddingInline={theme.spacing(1)}
          marginTop={theme.spacing(3)}
        >
          <Trans t={t}>
            <strong>Note:</strong> If any of the above information is not
            correct, please contact HR Services with the correct information at{' '}
            <Link href="tel:888-278-7233">(888) 278-7233</Link> or{' '}
            <Link href="tel:407-826-2287">(407) 826-2287</Link>. Email:{' '}
            <Link href="mailto:HR@cru.org">HR@cru.org</Link>.
          </Trans>
        </Typography>
      </CardContent>
    </StepCard>
  );
};
