import { Tooltip, Typography } from '@mui/material';
import { amountFormat, zeroAmountFormat } from 'src/lib/intlFormat';
import { RenderCell } from '../Tables/TableCard';
import { RenderTotalCell } from '../Tables/TotalRow';

export const populateCardTableRows = (locale: string) => {
  const description: RenderCell = ({ row }) => {
    return (
      <Tooltip title={row.description}>
        <Typography variant="body2" noWrap>
          {row.description}
        </Typography>
      </Tooltip>
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
