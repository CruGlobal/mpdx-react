import React, { useId } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../../Shared/StepCard';
import { useFormatters } from '../../Shared/useFormatters';
import { StyledCardHeader } from '../StyledCardHeader';
import { useCaps } from '../useCaps';
import { CardTitle } from './CardTitle';
import { Category } from './Category';
import { Distribution } from './Distribution';
import { Legend } from './Legend';

const SummaryTable = styled(Table)(({ theme }) => ({
  'tr.total': {
    th: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(0.5),
    },
    '.MuiSvgIcon-root': {
      cursor: 'pointer',
      color: theme.palette.mpdxGrayDark.main,
      fontSize: '1rem',
    },
    '.MuiTableCell-root': {
      fontWeight: 'bold',
      backgroundColor: theme.palette.mpdxGrayLight.main,
    },
  },

  '.MuiTableCell-root .explanation': {
    display: 'block',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

export const RequestSummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
  const progressiveApprovalTier = calculation?.progressiveApprovalTier;
  const approvalRequired =
    !!progressiveApprovalTier &&
    progressiveApprovalTier?.tier !== ProgressiveApprovalTierEnum.DivisionHead;
  const boardCapException = hcmUser?.exceptionSalaryCap.boardCapException;
  const { combinedCap, combinedGross, overCapName, overCapSalary } = useCaps();

  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

  const combinedSeca =
    (calcs?.requestedSeca ?? 0) + (spouseCalcs?.requestedSeca ?? 0);
  const combined403b =
    (calcs?.contributing403bAmount ?? 0) +
    (spouseCalcs?.contributing403bAmount ?? 0);

  const categories: Category[] = [
    {
      label: t('Requested Salary (includes MHA)'),
      amount: combinedGross,
      color: theme.palette.yellow.main,
    },
    {
      label: t('SECA and Related Federal Taxes'),
      amount: combinedSeca,
      color: theme.palette.turquoise.main,
    },
    {
      label: t('403b Contribution'),
      amount: combined403b,
      color: theme.palette.green.main,
    },
  ];

  const combinedModifier = hasSpouse ? t('Combined') : '';
  const statusMessage = !progressiveApprovalTier ? (
    t('Your gross request is within your Maximum Allowable Salary.')
  ) : boardCapException ? (
    <Trans t={t}>
      You have a Board approved Maximum Allowable Salary (CAP) and your salary
      request exceeds that amount. As a result we need to get their approval for
      this request. We&apos;ll forward your request to them and get back to you
      with their decision.
    </Trans>
  ) : approvalRequired ? (
    <Trans t={t}>
      Your {{ combined: combinedModifier }} Gross Requested Salary exceeds your{' '}
      {{ combined: combinedModifier }} Maximum Allowable Salary. Please make
      adjustments to your Salary Request above or fill out the Approval Process
      Section below to request a higher amount through our Progressive Approvals
      process. This may take{' '}
      {{ timeframe: progressiveApprovalTier.approvalTimeframe }} as it needs to
      be signed off by the {{ approver: progressiveApprovalTier.approver }}.
      This may affect your selected effective date.
    </Trans>
  ) : (
    <Trans t={t}>
      Your Combined Gross Requested Salary is within your Combined Maximum
      Allowable Salary. However, {{ name: overCapName }}
      &apos;s Gross Requested Salary exceeds his individual Maximum Allowable
      Salary. If this is correct, please provide reasoning for why{' '}
      {{ name: overCapName }}&apos;s Salary should exceed{' '}
      {{ salary: overCapSalary }} in the Additional Information section below or
      make changes to how your Requested Salary is distributed above.
    </Trans>
  );

  const requestedVsMaxId = useId();
  const remainingId = useId();

  return (
    <StepCard>
      <StyledCardHeader
        title={<CardTitle invalid={!!progressiveApprovalTier} />}
      />
      <CardContent
        sx={(theme) => ({
          '.invalid': {
            fontWeight: 'bold',
            color: theme.palette.error.main,
          },
        })}
      >
        <Stack spacing={2}>
          <Typography
            variant="body1"
            pb={2}
            data-testid="RequestSummaryCard-status"
          >
            {statusMessage}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            data-testid="RequestSummaryCard-requestedVsMax"
          >
            <span id={requestedVsMaxId}>
              {hasSpouse
                ? t('Combined Gross Salary')
                : t('Your Gross Requested Salary')}{' '}
              / {t('Max Allowable Salary')}
            </span>
            <span
              aria-describedby={requestedVsMaxId}
              className={approvalRequired ? 'invalid' : undefined}
            >
              {formatCurrency(combinedGross)} / {formatCurrency(combinedCap)}
            </span>
          </Stack>

          <Distribution
            categories={categories}
            totalCap={combinedCap}
            invalid={approvalRequired}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            data-testid="RequestSummaryCard-remaining"
          >
            <Typography aria-describedby={remainingId} color="textSecondary">
              {t('Remaining in {{ combined }} Max Allowable Salary', {
                combined: combinedModifier,
              })}
            </Typography>
            <Typography
              id={remainingId}
              className={approvalRequired ? 'invalid' : undefined}
            >
              {formatCurrency(combinedCap - combinedGross)}
            </Typography>
          </Stack>

          <Legend categories={categories} />

          <SummaryTable>
            <TableHead>
              <TableRow>
                <TableCell scope="col">{t('Description')}</TableCell>
                <TableCell scope="col">
                  {hcmUser?.staffInfo.preferredName}
                </TableCell>
                {hasSpouse && (
                  <TableCell scope="col">
                    {hcmSpouse.staffInfo.preferredName}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  {t('Requested Salary (includes MHA)')}
                </TableCell>
                <TableCell>{formatCurrency(calcs?.annualBase)}</TableCell>
                {hasSpouse && (
                  <TableCell>
                    {formatCurrency(spouseCalcs.annualBase)}
                  </TableCell>
                )}
              </TableRow>

              <TableRow>
                <TableCell component="th" scope="row">
                  {t('SECA and Related Federal Taxes')}
                  {calcs?.secaEstimatedFraction === 0 && (
                    <span className="explanation">
                      {t('{{ name }} has opted out of SECA', {
                        name: hcmUser?.staffInfo.preferredName,
                      })}
                    </span>
                  )}
                  {spouseCalcs?.secaEstimatedFraction === 0 && (
                    <span className="explanation">
                      {t('{{ name }} has opted out of SECA', {
                        name: hcmSpouse?.staffInfo.preferredName,
                      })}
                    </span>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(calcs?.requestedSeca)}</TableCell>
                {hasSpouse && (
                  <TableCell>
                    {formatCurrency(spouseCalcs.requestedSeca)}
                  </TableCell>
                )}
              </TableRow>

              <TableRow>
                <TableCell component="th" scope="row">
                  {t('403b Contribution')}
                </TableCell>
                <TableCell>
                  {formatCurrency(calcs?.contributing403bAmount)}
                </TableCell>
                {hasSpouse && (
                  <TableCell>
                    {formatCurrency(spouseCalcs.contributing403bAmount)}
                  </TableCell>
                )}
              </TableRow>

              <TableRow className="total">
                <TableCell component="th" scope="row">
                  {t('Gross Requested Salary')}
                  <Tooltip
                    title={t('Your Requested Salary plus 403(b) and taxes.')}
                  >
                    <InfoIcon />
                  </Tooltip>
                </TableCell>
                <TableCell className={approvalRequired ? 'invalid' : undefined}>
                  {formatCurrency(calcs?.requestedGross)}
                </TableCell>
                {hasSpouse && (
                  <TableCell
                    className={approvalRequired ? 'invalid' : undefined}
                  >
                    {formatCurrency(spouseCalcs.requestedGross)}
                  </TableCell>
                )}
              </TableRow>

              <TableRow className="total">
                <TableCell component="th" scope="row">
                  {t('Maximum Allowable Salary')}
                  <Tooltip
                    title={t(
                      'The maximum amount you can request without requiring additional approval. \
For couples splitting a combined cap, this amount is based on your Gross Requested Salary \
plus any amount remaining in your combined cap.',
                    )}
                  >
                    <InfoIcon />
                  </Tooltip>
                </TableCell>
                <TableCell>{formatCurrency(calcs?.effectiveCap)}</TableCell>
                {hasSpouse && (
                  <TableCell>
                    {formatCurrency(spouseCalcs.effectiveCap)}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </SummaryTable>
        </Stack>
      </CardContent>
    </StepCard>
  );
};
