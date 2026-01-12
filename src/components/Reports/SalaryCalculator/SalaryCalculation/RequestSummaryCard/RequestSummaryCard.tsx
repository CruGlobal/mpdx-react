import React, { useId } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  CardContent,
  CardHeader,
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
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../../Shared/StepCard';
import { useApprovers } from '../../Shared/useApprovers';
import { useFormatters } from '../../Shared/useFormatters';
import { CardTitle } from './CardTitle';
import { Category } from './Category';
import { Distribution } from './Distribution';
import { Legend } from './Legend';

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

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

export const RequestedSummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
  const { approvers } = useApprovers();
  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

  const combinedCap =
    (calcs?.effectiveCap ?? 0) + (spouseCalcs?.effectiveCap ?? 0);
  const combinedGross =
    (calcs?.requestedGross ?? 0) + (spouseCalcs?.requestedGross ?? 0);
  const combinedSeca =
    (calcs?.requestedSeca ?? 0) + (spouseCalcs?.requestedSeca ?? 0);
  const combined403b =
    (calcs?.contributing403bAmount ?? 0) +
    (spouseCalcs?.contributing403bAmount ?? 0);

  const overCap = combinedGross > combinedCap;
  const userOverCap = !!calcs && calcs.requestedGross > calcs.effectiveCap;
  const spouseOverCap =
    !!spouseCalcs && spouseCalcs.requestedGross > spouseCalcs.effectiveCap;

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
  const statusMessage =
    !overCap && !userOverCap && !spouseOverCap
      ? t('Your gross request is within your Maximum Allowable Salary.')
      : overCap
        ? t(
            'Your {{ combined }} Gross Requested Salary exceeds your {{ combined }} Maximum Allowable Salary. \
Please make adjustments to your Salary Request above \
or fill out the Approval Process Section below to request a higher amount through our Progressive Approvals process. \
This may take [time frame] as it needs to be signed off by {{ approvers }}. \
This may affect your selected effective date.',
            { combined: combinedModifier, approvers },
          )
        : t(
            "Your Combined Gross Requested Salary is within your Combined Maximum Allowable Salary. \
However, {{ name }}'s Gross Requested Salary exceeds his individual Maximum Allowable Salary. \
If this is correct, please provide reasoning for why {{ name }}'s Salary should exceed {{ salary }} in the Additional Information section below \
or make changes to how your Requested Salary is distributed above.",
            {
              name: userOverCap
                ? hcmUser?.staffInfo.preferredName
                : hcmSpouse?.staffInfo.preferredName,
              salary: formatCurrency(
                userOverCap
                  ? calcs.requestedGross
                  : spouseCalcs?.requestedGross,
              ),
            },
          );

  const requestedVsMaxId = useId();
  const remainingId = useId();

  return (
    <StepCard>
      <StyledCardHeader
        title={<CardTitle invalid={overCap || userOverCap || spouseOverCap} />}
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
              className={overCap ? 'invalid' : undefined}
            >
              {formatCurrency(combinedGross)} / {formatCurrency(combinedCap)}
            </span>
          </Stack>

          <Distribution
            categories={categories}
            totalCap={combinedCap}
            invalid={overCap}
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
              className={overCap ? 'invalid' : undefined}
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
                <TableCell className={overCap ? 'invalid' : undefined}>
                  {formatCurrency(calcs?.requestedGross)}
                </TableCell>
                {hasSpouse && (
                  <TableCell className={overCap ? 'invalid' : undefined}>
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
