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

export const MpdGoalStepRightPanelAccordion: React.FC = () => {
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
      hasSpace: true,
    },
    {
      line: '1E',
      title: t('Roth 403(b) Contribution'),
      content: t(
        'Information about Roth 403(b) contribution limits and calculations.',
      ),
    },
    {
      line: '1F',
      title: t('100% - Roth + Traditional 403(b) %'),
      content: t(
        'Percentage calculation for combined Roth and Traditional 403(b) contributions.',
      ),
    },
    {
      line: '1G',
      title: t('Roth 403(b), Traditional 403b'),
      content: t(
        'Comparison and details about Roth vs Traditional 403(b) retirement plans.',
      ),
    },
    {
      line: '1H',
      title: t('Gross Annual Salary'),
      content: t(
        'Information about gross annual salary calculations and components.',
      ),
      hasSpace: true,
    },
    {
      line: '1I',
      title: t('Gross Monthly Salary'),
      content: t('Monthly breakdown of gross salary before deductions.'),
    },
    {
      line: '1J',
      title: t('Benefits Charge'),
      content: t('Details about benefits charges and what they include.'),
      hasSpace: true,
    },
    {
      line: '1',
      title: t('Ministry Mileage'),
      content: t(
        'Information about ministry-related mileage reimbursement and tracking.',
      ),
    },
    {
      line: '2',
      title: t('Medical Mileage'),
      content: t(
        'Details about medical mileage deductions and reimbursement policies.',
      ),
    },
    {
      line: '3',
      title: t('Medical Expenses'),
      content: t(
        'Information about medical expense deductions and healthcare benefits.',
      ),
    },
  ];

  return (
    <Box>
      {accordionItems.map((item, index) => (
        <Accordion
          key={item.title}
          sx={{ mb: item.hasSpace ? theme.spacing(3) : 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
            sx={{
              '& .MuiAccordionSummary-content': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
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
            <Typography variant="body2" color={theme.palette.text.secondary}>
              {item.content}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
