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
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import { MonthlyNeedsCard } from '../../Shared/GoalPresentation/MonthlyNeedsCard';
import { PersonalInfoCard } from '../../Shared/GoalPresentation/PersonalInfoCard';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { SpecialNeedsCard } from '../../Shared/GoalPresentation/SpecialNeedsCard';
import { SupportNeedsChart } from '../../Shared/GoalPresentation/SupportNeedsChart';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { ChartPlaceholderCard } from './ChartPlaceholderCard';

const PrintableContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  // Scale down the page to fit on one page
  '@media print': {
    zoom: 0.4,
  },
}));

// TODO(MPDX-9801): Special needs are not available yet.
const specialNeedsPlaceholder = 3624;

interface PresentingYourGoalStepProps {
  goalCalculation: NsGoalCalculation;
}

export const PresentingYourGoalStep: React.FC<PresentingYourGoalStepProps> = ({
  goalCalculation,
}) => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();
  const accountListId = useAccountListId() ?? '';
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? null;

  const { calculations } = goalCalculation;
  const married =
    goalCalculation.maritalStatus ===
    NewStaffQuestionnaireMaritalStatusEnum.Married;
  const monthlyNeeds = useMemo(
    () => ({
      married,
      salary: calculations.salary,
      ministryExpenses:
        calculations.totalMinistryExpenses + calculations.attrition,
      benefits: calculations.benefitsCharge,
      socialSecurityAndTaxes: calculations.seca,
      voluntaryRetirement: calculations.totalContributing403bAmount,
      adminCharge: calculations.adminCharge,
    }),
    [married, calculations],
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
          <li>{t('Adjust the Scale to fit on one page.')}</li>
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
        supportRaised={supportRaised}
      />

      <SpecialNeedsCard specialNeeds={specialNeedsPlaceholder} />

      <Grid container spacing={theme.spacing(3)}>
        <Grid item xs={12} lg={6}>
          <PresentationCard title={t('Monthly Support Needs Chart')}>
            <SupportNeedsChart monthlyNeeds={monthlyNeeds} />
          </PresentationCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartPlaceholderCard title={t('Special Needs Chart')} />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        onClick={handleContinue}
        className="print-hidden"
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('Continue')}
      </Button>
    </PrintableContent>
  );
};
