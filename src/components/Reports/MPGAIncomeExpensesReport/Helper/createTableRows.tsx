import { Tooltip, Typography } from '@mui/material';
import { zeroAmountFormat } from 'src/lib/intlFormat';
import { RenderCell } from '../Tables/TableCard';

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
      <Tooltip title={zeroAmountFormat(row.average, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.average, locale)}
        </Typography>
      </Tooltip>
    );
  };

  const total: RenderCell = ({ row }) => {
    return (
      <Tooltip title={zeroAmountFormat(row.total, locale)}>
        <Typography variant="body2" noWrap>
          {zeroAmountFormat(row.total, locale)}
        </Typography>
      </Tooltip>
    );
  };

  return { description, average, total };
};
