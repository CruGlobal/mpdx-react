import React, { useMemo } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PrintIcon from '@mui/icons-material/Print';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { MonthlyNeedsCard } from '../../Shared/GoalPresentation/MonthlyNeedsCard';
import { PersonalInfoCard } from '../../Shared/GoalPresentation/PersonalInfoCard';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { SpecialNeedsCard } from '../../Shared/GoalPresentation/SpecialNeedsCard';
import { SupportNeedsChart } from '../../Shared/GoalPresentation/SupportNeedsChart';
import { useMonthlyNeedsRows } from '../../Shared/GoalPresentation/useMonthlyNeedsRows';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { useSpecialNeedsCategories } from '../Shared/useSpecialNeedsCategories';

const PrintableContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  // Scale down the page to fit on one page
  '@media print': {
    zoom: 0.4,
  },
}));

interface PresentingYourGoalContentProps {
  goalCalculation: NsGoalCalculation;
  /** Optional trailing content, e.g. the staff wizard's Continue button. */
  footer?: React.ReactNode;
}

/**
 * The Support Needs Presentation UI. Shared by the staff wizard's Presenting
 * step and the coaching Goal Settings view so the two presentations never
 * drift. Both derive their display from the same saved goal calculation.
 */
export const PresentingYourGoalContent: React.FC<
  PresentingYourGoalContentProps
> = ({ goalCalculation, footer }) => {
  const { t } = useTranslation();

  const { calculations } = goalCalculation;
  const married =
    goalCalculation.maritalStatus ===
    NewStaffQuestionnaireMaritalStatusEnum.Married;
  const monthlyNeeds = useMemo(
    () => ({
      married,
      salary: calculations.salary,
      ministryExpenses:
        calculations.totalMinistryExpenses +
        calculations.medicalExpenses +
        calculations.staffConferenceTransfer +
        calculations.accountTransfers +
        calculations.advocacyTransfers +
        calculations.otherExpenses +
        calculations.attrition,
      benefits: calculations.benefitsCharge,
      socialSecurityAndTaxes: calculations.seca,
      voluntaryRetirement: calculations.totalContributing403bAmount,
      adminCharge: calculations.adminCharge,
      monthlyGoal: calculations.monthlyGoal,
    }),
    [married, calculations],
  );
  const monthlyNeedsRows = useMonthlyNeedsRows(monthlyNeeds);
  const specialNeeds = useSpecialNeedsCategories(calculations);
  const specialNeedsCategories = useMemo(
    () => [
      ...specialNeeds.map(({ title, amount }) => ({ title, amount })),
      {
        title: t('Administrative Charge'),
        amount:
          calculations.specialNeedsTotal - calculations.specialNeedsSubtotal,
      },
    ],
    [specialNeeds, calculations, t],
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrintableContent>
      <Typography variant="h6">{t('Presenting Your Goal')}</Typography>

      <Typography variant="body1" className="print-hidden">
        {t(
          "Now that you've reviewed your goal, you can share your Support Needs Presentation by printing the presentation below.",
        )}
      </Typography>

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        className="print-hidden"
      >
        <Typography variant="body1" fontWeight="bold">
          {t('Some tips for printing:')}
        </Typography>
        <Box component="ol" sx={{ my: 1, pl: 3 }}>
          <li>{t('Toggle off Headers and Footers in your print settings.')}</li>
          <li>
            {t(
              'From your Print settings, you may also save the page as a PDF to share digitally.',
            )}
          </li>
        </Box>
      </Alert>

      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        className="print-hidden"
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('Print Support Needs Presentation')}
      </Button>

      <Divider className="print-hidden" />

      <PersonalInfoCard
        firstName={goalCalculation.firstName ?? ''}
        spouseFirstName={married ? goalCalculation.spouseFirstName : undefined}
        lastName={goalCalculation.lastName ?? ''}
        ministryLocation={goalCalculation.ministryLocation ?? undefined}
      />

      <MonthlyNeedsCard
        monthlyNeeds={monthlyNeeds}
        supportRaised={calculations.supportRaised ?? null}
      />

      <SpecialNeedsCard specialNeeds={calculations.specialNeedsTotal} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PresentationCard
            title={t('Monthly Support Needs Chart')}
            horizontalScroll={false}
          >
            <SupportNeedsChart needsCategories={monthlyNeedsRows} />
          </PresentationCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PresentationCard
            title={t('Special Needs Chart')}
            horizontalScroll={false}
          >
            <SupportNeedsChart needsCategories={specialNeedsCategories} />
          </PresentationCard>
        </Grid>
      </Grid>

      {footer}
    </PrintableContent>
  );
};
