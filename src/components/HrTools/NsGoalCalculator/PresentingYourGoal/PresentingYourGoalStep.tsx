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
import theme from 'src/theme';
import {
  PersonalInfoRow,
  PersonalInfoTable,
} from '../../Shared/GoalPresentation/PersonalInfoTable';
import { PresentationSectionCard } from '../../Shared/GoalPresentation/PresentationSectionCard';
import {
  SupportNeedsRow,
  SupportNeedsTable,
} from '../../Shared/GoalPresentation/SupportNeedsTable';
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
  name: 'John and Jane Doe',
  missionAgency: 'Campus Crusade for Christ, Inc.',
  ministryLocation: 'Lake Hart',
};

const mockSupportNeeds = {
  salary: 8774,
  ministryExpenses: 898,
  benefits: 1911,
  socialSecurityAndTaxes: 1492,
  voluntaryRetirement: 990,
  administrativeCharge: 1795,
  totalSupportGoal: 15859,
  totalSolidSupport: 1200,
  totalSpecialNeedsGoal: 3624,
};

export const PresentingYourGoalStep: React.FC = () => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();

  const handlePrint = () => {
    window.print();
  };

  const personalInfoRows: PersonalInfoRow[] = useMemo(
    () => [
      { label: t('Name'), value: mockPersonalInfo.name },
      { label: t('Mission Agency'), value: mockPersonalInfo.missionAgency },
      {
        label: t('Ministry Location'),
        value: mockPersonalInfo.ministryLocation,
      },
    ],
    [t],
  );

  const supportNeedsRows: SupportNeedsRow[] = useMemo(
    () => [
      {
        title: t('Salary (Combined if for Husband and Wife)'),
        description: t(
          'Salaries are based upon marital status, number of children, tenure with Cru, and adjustments for certain geographic locations.',
        ),
        amount: mockSupportNeeds.salary,
      },
      {
        title: t('Ministry Expenses'),
        description: t(
          'Training, conferences, supplies, evangelism & discipleship materials, communication with ministry partners, ministry travel expenses, etc.',
        ),
        amount: mockSupportNeeds.ministryExpenses,
      },
      {
        title: t('Benefits'),
        description: t(
          "Includes group medical and dental coverage, life insurance, disability insurance, worker's compensation, and employer contribution to a 403(b) retirement plan.",
        ),
        amount: mockSupportNeeds.benefits,
      },
      {
        title: t('Social Security and Taxes'),
        description: t(
          'Since Campus Crusade is a non-profit organization, staff members are responsible for paying the entire amount of Social Security.',
        ),
        amount: mockSupportNeeds.socialSecurityAndTaxes,
      },
      {
        title: t('Voluntary 403b Retirement Plan'),
        description: t(
          'Staff members are eligible to contribute to a voluntary retirement program each month.',
        ),
        amount: mockSupportNeeds.voluntaryRetirement,
      },
      {
        title: t('Administrative Charge'),
        titleBold: false,
        amount: mockSupportNeeds.administrativeCharge,
      },
      {
        title: t('Total Support Goal'),
        amount: mockSupportNeeds.totalSupportGoal,
        bold: true,
      },
      {
        title: t('Total Solid Support'),
        titleBold: false,
        amount: mockSupportNeeds.totalSolidSupport,
      },
    ],
    [t],
  );

  const specialNeedsRows: SupportNeedsRow[] = useMemo(
    () => [
      {
        title: t('Total Special Needs Goal'),
        description: t(
          'NSO/IBS Tuition, housing, food, travel, MPD Refresh Retreat, Faith & Finance Course.',
        ),
        amount: mockSupportNeeds.totalSpecialNeedsGoal,
      },
    ],
    [t],
  );

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

          <PresentationSectionCard title={t('Personal Information')}>
            <PersonalInfoTable rows={personalInfoRows} />
          </PresentationSectionCard>

          <PresentationSectionCard title={t('Monthly Support Needs')}>
            <SupportNeedsTable rows={supportNeedsRows} />
          </PresentationSectionCard>

          <PresentationSectionCard title={t('Special Needs')}>
            <SupportNeedsTable rows={specialNeedsRows} />
          </PresentationSectionCard>

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
