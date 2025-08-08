import { Tooltip, Typography } from '@mui/material';
import { RenderCell } from '../Tables/TableCard';

export const populateCardTableRows = () => {
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
      <Tooltip title={row.average}>
        <Typography variant="body2" noWrap>
          {row.average}
        </Typography>
      </Tooltip>
    );
  };

  const total: RenderCell = ({ row }) => {
    return (
      <Tooltip title={row.total}>
        <Typography variant="body2" noWrap>
          {row.total}
        </Typography>
      </Tooltip>
    );
  };

  return { description, average, total };
};
