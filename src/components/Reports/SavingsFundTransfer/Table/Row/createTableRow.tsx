import { ArrowForward, Delete, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { ScheduleEnum, StatusEnum, TransferHistory } from '../../mockData';
import { RenderCell } from '../TransferHistoryTable';
import { chipStyle, iconMap } from './createTableRowHelper';

export const populateTransferHistoryRows = (
  handleEditModalOpen: (transfer: TransferHistory) => void,
  handleDeleteModalOpen: (transfer: TransferHistory) => void,
  t: TFunction,
  locale: string,
) => {
  const transfers: RenderCell = ({ row }) => {
    const fromIconName = row.transferFrom || 'staffAccount';
    const toIconName = row.transferTo || 'staffSavings';
    const fromIcon =
      iconMap[fromIconName.charAt(0).toUpperCase() + fromIconName.slice(1)];
    const toIcon =
      iconMap[toIconName.charAt(0).toUpperCase() + toIconName.slice(1)];

    if (fromIcon && toIcon) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {fromIcon}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {toIcon}
        </Box>
      );
    }

    return (
      <Tooltip title={t('N/A') as string}>
        <Typography variant="body2" noWrap>
          {t('N/A') as string}
        </Typography>
      </Tooltip>
    );
  };

  const amount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.amount?.toLocaleString(locale, {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
    );
  };

  const schedule: RenderCell = ({ row }) => {
    if (row.schedule === ScheduleEnum.OneTime) {
      return (
        <Typography variant="body2" noWrap>
          {t('One Time') as string}
        </Typography>
      );
    } else {
      return (
        <Typography variant="body2" noWrap>
          {t('Monthly') as string}
        </Typography>
      );
    }
  };

  const status: RenderCell = ({ row }) => {
    const statusStyle = chipStyle[row.status as StatusEnum];

    if (statusStyle) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: statusStyle.avatarColor }}> </Avatar>}
          label={row.status}
          color="default"
          size="small"
          sx={{
            backgroundColor: statusStyle.chipColor,
            boxShadow: 'none',
            textTransform: 'capitalize',
          }}
        />
      );
    }

    return (
      <Typography variant="body2" noWrap>
        {row.status}
      </Typography>
    );
  };

  const transferDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.transferDate?.toLocaleString(DateTime.DATE_MED) ||
          (t('N/A') as string)}
      </Typography>
    );
  };

  const endDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.endDate?.toLocaleString(DateTime.DATE_MED) || (t('N/A') as string)}
      </Typography>
    );
  };

  const note: RenderCell = ({ row }) => {
    return (
      <Tooltip title={t(row.note ? row.note : 'N/A') as string}>
        <Typography variant="body2" noWrap>
          {row.note}
        </Typography>
      </Tooltip>
    );
  };

  const actions: RenderCell = ({ row }) => {
    if (row.actions === 'edit-delete') {
      return (
        <>
          <IconButton>
            <Edit titleAccess="Edit" onClick={() => handleEditModalOpen(row)} />
          </IconButton>
          <IconButton>
            <Delete
              titleAccess="Delete"
              sx={{ color: 'error.main' }}
              onClick={() => {
                handleDeleteModalOpen(row);
              }}
            />
          </IconButton>
        </>
      );
    }

    return (
      <Typography variant="body2" noWrap>
        {row.actions}
      </Typography>
    );
  };

  return {
    transfers,
    amount,
    schedule,
    status,
    transferDate,
    endDate,
    note,
    actions,
  };
};
