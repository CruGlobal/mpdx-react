import React from 'react';
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
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import { MonthlyNeedsCard } from '../../Shared/GoalPresentation/MonthlyNeedsCard';
import { PersonalInfoCard } from '../../Shared/GoalPresentation/PersonalInfoCard';
import { SpecialNeedsCard } from '../../Shared/GoalPresentation/SpecialNeedsCard';
import { useNsGoalCalculator } from '../Shared/NsGoalCalculatorContext';
import { NsGoalCalculatorLayout } from '../Shared/NsGoalCalculatorLayout';
import { ChartPlaceholderCard } from './ChartPlaceholderCard';

const PrintableContent = styled('div')(({ theme }) => ({
  marginInline: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  // Scale down the page to fit on one page
  '@media print': {
    zoom: 0.4,
  },
}));

// Mock data for building out the layout. Will be replaced with real goal
// calculation data once the new staff goal API is available.
const mockPersonalInfo = {
  firstName: 'John',
  spouseFirstName: 'Jane',
  lastName: 'Doe',
  ministryLocation: 'Lake Hart',
  married: true,
};

const mockSupportNeeds = {
  salary: 8774,
  ministryExpenses: 898,
  benefits: 1911,
  socialSecurityAndTaxes: 1492,
  voluntaryRetirement: 990,
  adminCharge: 1795,
  specialNeeds: 3624,
};

export const PresentingYourGoalStep: React.FC = () => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();
  const accountListId = useAccountListId() ?? '';
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <NsGoalCalculatorLayout
      mainContent={
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
              <li>
                {t('Toggle off Headers and Footers in your print settings.')}
              </li>
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
            firstName={mockPersonalInfo.firstName}
            spouseFirstName={mockPersonalInfo.spouseFirstName}
            lastName={mockPersonalInfo.lastName}
            ministryLocation={mockPersonalInfo.ministryLocation}
          />

          <MonthlyNeedsCard
            married={mockPersonalInfo.married}
            salary={mockSupportNeeds.salary}
            ministryExpenses={mockSupportNeeds.ministryExpenses}
            benefits={mockSupportNeeds.benefits}
            socialSecurityAndTaxes={mockSupportNeeds.socialSecurityAndTaxes}
            voluntaryRetirement={mockSupportNeeds.voluntaryRetirement}
            adminCharge={mockSupportNeeds.adminCharge}
            supportRaised={supportRaised}
          />

          <SpecialNeedsCard specialNeeds={mockSupportNeeds.specialNeeds} />

          <Grid container spacing={theme.spacing(3)}>
            <Grid item xs={12} lg={6}>
              <ChartPlaceholderCard title={t('Monthly Support Needs Chart')} />
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
      }
    />
  );
};
