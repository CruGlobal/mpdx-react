import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface AccordionItem {
  line: string;
  title: string;
  content: string;
  hasSpace?: boolean;
}

export const MpdGoalStepRightPanelAccordions: React.FC = () => {
  const { t } = useTranslation();

  const accordionItems: AccordionItem[] = [
    {
      line: '1A',
      title: t('Net Monthly Combined Salary'),
      content: t(
        'Information about net monthly combined salary calculations and requirements.',
      ),
    },
    {
      line: '1B',
      title: t('Taxes, SECA, VTL, etc. %'),
      content: t(
        'Percentage breakdown of taxes, SECA, VTL and other deductions.',
      ),
    },
    {
      line: '1C',
      title: t('Taxes, SECA, VTL, etc.'),
      content: t(
        'Detailed information about taxes, SECA, VTL and other applicable deductions.',
      ),
    },
    {
      line: '1D',
      title: t('Subtotal with Net, Taxes, and SECA'),
      content: t(
        'Calculation showing subtotal including net salary, taxes, and SECA contributions.',
      ),
    },
    {
      line: '1E',
      title: t('Roth 403(b) Contribution %'),
      content: t(
        'Percentage of salary contributed to Roth 403(b) retirement account.',
      ),
    },
    {
      line: '1F',
      title: t('Traditional 403(b) Contribution %'),
      content: t(
        'Percentage of salary contributed to Traditional 403(b) retirement account.',
      ),
    },
    {
      line: '1G',
      title: t('100% - (Roth + Traditional 403(b)) %'),
      content: t(
        'Percentage remaining after subtracting Roth and Traditional 403(b) contributions.',
      ),
    },
    {
      line: '1H',
      title: t('Roth 403(b)'),
      content: t(
        'Dollar amount contributed to Roth 403(b) retirement account.',
      ),
    },
    {
      line: '1I',
      title: t('Traditional 403(b)'),
      content: t(
        'Dollar amount contributed to Traditional 403(b) retirement account.',
      ),
    },
    {
      line: '1J',
      title: t('Gross Annual Salary'),
      content: t(
        'Total annual salary before deductions, including all 403(b) contributions.',
      ),
      hasSpace: true,
    },
    {
      line: '1',
      title: t('Gross Monthly Salary'),
      content: t(
        'Monthly gross salary calculated from annual salary divided by 12.',
      ),
    },
    {
      line: '2',
      title: t('Benefits'),
      content: t(
        'Benefits charges including health insurance and other staff benefits.',
      ),
    },
    {
      line: '3',
      title: t('Ministry Expenses'),
      content: t(
        'Various ministry-related expenses including miles, travel, meetings, meals, MPD, supplies, summer assignments, medical expenses, account transfers, and other costs.',
      ),
    },
    {
      line: '4',
      title: t('Ministry Expenses Subtotal'),
      content: t('Sum of all ministry expenses plus benefits.'),
    },
    {
      line: '5',
      title: t('Subtotal'),
      content: t('Overall subtotal before admin charge and attrition.'),
    },
    {
      line: '6',
      title: t('Subtotal with admin charge'),
      content: t('Subtotal including the administrative charge percentage.'),
      hasSpace: true,
    },
    {
      line: '7',
      title: t('Total Goal (with attrition)'),
      content: t(
        'Final total goal including attrition rate applied to line 6.',
      ),
    },
    {
      line: '8',
      title: t('Solid Monthly Support Developed'),
      content: t('Amount of monthly support already raised and committed.'),
    },
    {
      line: '9',
      title: t('Monthly Support to be Developed'),
      content: t('Remaining monthly support needed to reach the total goal.'),
    },
    {
      line: '10',
      title: t('Support Goal Percentage Progress'),
      content: t(
        'Percentage of the total goal that has been achieved through developed support.',
      ),
    },
  ];

  return (
    <Box data-testid="accordions">
      {accordionItems.map((item, index) => (
        <Accordion
          key={item.title}
          sx={{ mb: item.hasSpace ? theme.spacing(3) : 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            id={`panel${index + 1}-header`}
            sx={{
              '.MuiAccordionSummary-content': {
                justifyContent: 'center',
                gap: theme.spacing(2),
              },
            }}
          >
            <Typography
              sx={{
                minWidth: theme.spacing(16),
              }}
            >
              {item.line}
            </Typography>

            <Typography sx={{ flex: 1, textAlign: 'left' }}>
              {item.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              data-testid={`content-${index + 1}-typography`}
              variant="body1"
              color={theme.palette.text.primary}
            >
              {item.content}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
