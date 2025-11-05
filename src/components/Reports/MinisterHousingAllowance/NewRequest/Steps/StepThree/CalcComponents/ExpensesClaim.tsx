import React from 'react';
import { Close, RequestPageSharp } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface ExpensesClaimProps {
  onClose?: () => void;
}

export const ExpensesClaim: React.FC<ExpensesClaimProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('What Expenses can I claim on my MHA?')}
        </Typography>
        <IconButton>
          <Close onClick={onClose} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 1,
          mb: 2,
        }}
      >
        <RequestPageSharp sx={{ color: theme.palette.chartOrange.main }} />
        <Typography variant="h6">
          <b>{t('Allowable Expenses for MHA')}</b>
        </Typography>
      </Box>
      <Box>
        <Trans i18nKey="expensesClaimInfo">
          <p style={{ marginBottom: 10 }}>
            The following is a list of typical expenses that should be
            considered when determining your allowance.
          </p>

          <ol style={{ marginLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>
              Rent or mortgage payments. Cost of buying a home and down
              payments.
            </li>
            <li style={{ marginBottom: 10 }}>
              Real estate taxes and mortgage interest for the home. These
              expenses are deductible again as itemized deductions. A Double
              Deduction (allowable by the IRS).
            </li>
            <li style={{ marginBottom: 10 }}>
              Insurance on the home and/or contents.
            </li>
            <li style={{ marginBottom: 10 }}>
              Improvements, repairs and upkeep of the home and/or contents. Such
              as a new roof, room addition, garage, patio, fence, pool,
              appliance repair, etc.
            </li>
            <li style={{ marginBottom: 10 }}>
              Furnishings and appliances: dish washer, vacuum cleaner, TV, VCR,
              stereo, piano, computer (personal use), washer, dryer, beds, small
              kitchen appliances, cookware, dishes, sewing machine, garage door
              opener, lawnmower, hedge trimmer, etc.
            </li>
            <li style={{ marginBottom: 10 }}>
              Decorator items: drapes, throw rugs, pictures, knick-knacks,
              painting, wallpapering, bedspreads, sheets, towels, etc.
            </li>
            <li style={{ marginBottom: 10 }}>
              Utilities: heat, electric, non-business telephone, water, cable,
              TV, sewer charge, garbage removal, etc. (Show business telephone
              expense as a professional expense. It will result in less social
              security tax).
            </li>
            <li style={{ marginBottom: 10 }}>
              Miscellaneous: anything that maintains the home and its contents
              that you haven&apos;t included in repairs or decorator items:
              cleaning supplies for the home, brooms, light bulbs, dry cleaning
              of drapes, shampooing carpet, expense to run lawnmower, tools for
              landscaping, garden hoses, etc.
            </li>
          </ol>

          <p style={{ marginTop: 10 }}>
            You should keep your receipts to substantiate your requested
            allowance amount in case you are ever audited by the IRS.
          </p>

          <p style={{ marginTop: 10 }}>
            Note: Items not included are: maid or hired lawn care, groceries,
            clothing, personal toiletries, paper products, laundry or dish soap,
            jewelry, toys, bicycles, CD&apos;s, computer software and games,
            hobby items or video&apos;s.
          </p>
        </Trans>
      </Box>
    </Box>
  );
};
