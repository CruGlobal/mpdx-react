import { InfoOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { TFunction } from 'react-i18next';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { amountFormat, zeroAmountFormat } from 'src/lib/intlFormat';
import { RenderCell } from '../Tables/TableCard';
import { RenderTotalCell } from '../Tables/TotalRow';
import { CategoryBreakdown } from '../mockData';

export const populateCardTableRows = (
  locale: string,
  t: TFunction,
  breakdownData: Partial<Record<StaffExpenseCategoryEnum, CategoryBreakdown[]>>,
) => {
  const description: RenderCell = ({ row }) => {
    const breakdown = row.category && breakdownData[row.category];
    return (
      <Box display="flex" alignItems="center" width="100%">
        <Tooltip title={row.description}>
          <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
            {row.description}
          </Typography>
        </Tooltip>
        {!!breakdown?.length && (
          <IconButton
            size="small"
            sx={{ ml: 'auto', flexShrink: 0 }}
            aria-label={t('View breakdown')}
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  const average: RenderCell = ({ row }) => {
    return (
      <Tooltip title={amountFormat(row.average, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.average, locale)}
        </Typography>
      </Tooltip>
    );
  };

  const total: RenderCell = ({ row }) => {
    return (
      <Tooltip title={amountFormat(row.total, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.total, locale)}
        </Typography>
      </Tooltip>
    );
  };

  return { description, average, total };
};

export const populateTotalRows = (locale: string) => {
  const description: RenderTotalCell = ({ row }) => (
    <Tooltip title={row.description}>
      <Typography variant="body2" noWrap>
        {row.description}
      </Typography>
    </Tooltip>
  );

  const average: RenderTotalCell = ({ row }) => {
    return (
      <Tooltip title={amountFormat(row.avgTotal, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.avgTotal, locale)}
        </Typography>
      </Tooltip>
    );
  };

  const overall: RenderTotalCell = ({ row }) => {
    return (
      <Tooltip title={amountFormat(row.overall, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.overall, locale)}
        </Typography>
      </Tooltip>
    );
  };

  return { description, average, overall };
};
