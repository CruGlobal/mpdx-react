import Link from 'next/link';
import React, { useMemo } from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { AutosaveAutocomplete } from '../../Autosave/AutosaveAutocomplete';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard, StepTableHead } from '../../Shared/StepCard';
import { usePersonalInformation } from './usePersonalInformation';

export const PersonalInformationSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hcmSpouse } = useSalaryCalculator();
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
        data-testid="personal-information-header"
      />
      <CardContent>
        <Typography variant="body1">
          {t(
            'Your Maximum Allowable Salary (CAP) is based on the following information:',
          )}
        </Typography>
        <Table>
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
        <Typography
          variant="body2"
          paddingInline={theme.spacing(1)}
          marginTop={theme.spacing(3)}
        >
          <Trans t={t}>
            <strong>Note:</strong> If any of the above information is not
            correct, please contact HR Services with the correct information at
            (888) 278-7233 or (407) 826-2287. Email:{' '}
            {/* TODO: Update email address once provided by stakeholders (refer to Figma) */}
            <Link href="mailto:--@cru.org">--@cru.org</Link>
          </Trans>
        </Typography>
      </CardContent>
    </StepCard>
  );
};
