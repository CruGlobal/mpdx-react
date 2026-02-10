import React, { useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { CardContent, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../../Shared/StepCard';
import { StyledCardHeader } from '../StyledCardHeader';
import { useCaps } from '../useCaps';

export const ApprovalProcessCard: React.FC = () => {
  const { t } = useTranslation();
  const { calculation, hcmSpouse } = useSalaryCalculator();
  const { overCapName, overCapSalary } = useCaps();

  const schema = useMemo(
    () =>
      yup.object({
        additionalInfo: yup.string().required(t('Additional info is required')),
      }),
    [t],
  );

  const spouseName = hcmSpouse?.staffInfo.preferredName;

  const tier = calculation?.progressiveApprovalTier?.tier;
  if (!tier) {
    return null;
  }

  const approvalRequired = tier !== ProgressiveApprovalTierEnum.DivisionHead;

  return (
    <StepCard>
      <StyledCardHeader
        title={
          <>
            <InfoIcon color="info" />
            <Typography
              variant="h6"
              color="info.main"
              sx={{ fontWeight: 'bold' }}
            >
              {approvalRequired
                ? t('Approval Process')
                : t('Additional Information')}
            </Typography>
            {approvalRequired && (
              <Typography color="textSecondary" ml={4}>
                {t('Approvals are needed for this request')}
              </Typography>
            )}
          </>
        }
      />
      <CardContent>
        <Typography data-testid="ApprovalProcessCard-status">
          {approvalRequired ? (
            <Trans t={t}>
              Since you are requesting above your and {{ spouse: spouseName }}
              &apos;s combined Maximum Allowable Salary, you will need to
              provide the information below.
            </Trans>
          ) : (
            <Trans t={t}>
              {{ name: overCapName }}&apos;s Gross Requested Salary exceeds
              their individual Maximum Allowable Salary. If this is correct,
              please provide reasoning for why {{ name: overCapName }}&apos;s
              Salary should exceed {{ salary: overCapSalary }} or make changes
              to your Requested Salary above.
            </Trans>
          )}
        </Typography>
        <Typography>
          {tier === ProgressiveApprovalTierEnum.DivisionHead ? (
            <Trans t={t}>
              Since your combined request is still within your combined Max
              Allowable Salary, no additional approvals are required.
            </Trans>
          ) : (
            <Trans t={t}>
              Please explain in detail, what are the specific expenses and
              reasons why you are requesting this salary level.
            </Trans>
          )}
        </Typography>

        <AutosaveTextField
          sx={(theme) => ({
            marginTop: theme.spacing(1),
          })}
          fieldName="additionalInfo"
          schema={schema}
          label={t('Additional info')}
          multiline
          InputLabelProps={{ shrink: true }}
          rows={10}
          required
        />
      </CardContent>
    </StepCard>
  );
};
