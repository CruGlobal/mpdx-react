import { useEffect } from 'react';
import { ArrowForward, Cancel, Edit, StopCircle } from '@mui/icons-material';
import PriorityHigh from '@mui/icons-material/PriorityHigh';
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Icon,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { TFunction } from 'i18next';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import {
  ScheduleEnum,
  StatusEnum,
  TableTypeEnum,
  Transfers,
} from '../../mockData';
import { RenderCell } from '../TransfersTable';
import { chipStyle, iconMap } from './createTableRowHelper';

export const populateTransferRows = (
  type: TableTypeEnum,
  handleEditModalOpen: (transfer: Transfers) => void,
  handleDeleteModalOpen: (transfer: Transfers) => void,
  handleCalendarOpen: (transfer: Transfers) => void,
  handleFailedTransferOpen: (transfer: Transfers) => void,
  t: TFunction,
  locale: string,
) => {
  useEffect(() => {
    const MaterialSymbols = document.createElement('link');
    MaterialSymbols.rel = 'stylesheet';
    MaterialSymbols.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
    document.head.appendChild(MaterialSymbols);

    return () => {
      document.head.removeChild(MaterialSymbols);
    };
  }, []);

  const transfers: RenderCell = ({ row }) => {
    const fromIconName = row.transferFrom?.toLowerCase() || 'primary';
    const toIconName = row.transferTo?.toLowerCase() || 'savings';
    const fromIcon = iconMap[fromIconName];
    const toIcon = iconMap[toIconName];

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
    const failed = row.failedCount && row.failedCount > 0;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" noWrap>
          {currencyFormat(row.amount ?? 0, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </Typography>
        {failed ? (
          <Badge
            badgeContent={row.failedCount}
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 16,
                height: 16,
                lineHeight: '16px',
                padding: 0,
                borderRadius: '50%',
              },
            }}
          >
            <IconButton>
              <PriorityHigh
                sx={{ color: 'error.main' }}
                titleAccess={t('Failed Transfers') as string}
                onClick={() => handleFailedTransferOpen(row)}
              />
            </IconButton>
          </Badge>
        ) : (
          <Typography variant="body2" noWrap>
            {'' as string}
          </Typography>
        )}
      </Box>
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
        {row.transferDate
          ? dateFormat(row.transferDate, locale, { timezone: 'UTC' })
          : ''}
      </Typography>
    );
  };

  const endDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.schedule === ScheduleEnum.Monthly && row.endDate
          ? dateFormat(row.endDate, locale, { timezone: 'UTC' })
          : ''}
      </Typography>
    );
  };

  const note: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.note}
      </Typography>
    );
  };

  const actions: RenderCell = ({ row }) => {
    if (row.actions === 'edit-delete') {
      return type === TableTypeEnum.Upcoming ? (
        <>
          <IconButton>
            <Edit
              titleAccess={t('Edit')}
              onClick={() => handleEditModalOpen(row)}
            />
          </IconButton>
          <IconButton>
            <Cancel
              titleAccess={t('Cancel Transfer')}
              onClick={() => {
                handleDeleteModalOpen(row);
              }}
              sx={{ color: 'error.main' }}
            />
          </IconButton>
        </>
      ) : row.endDate ? (
        <>
          <IconButton
            title={t('Edit Stop Date') as string}
            onClick={(event) => {
              event.stopPropagation();
              handleCalendarOpen(row);
            }}
          >
            <Icon
              className="material-symbols-outlined"
              sx={{
                fontSize: 24,
                color: 'cruGrayMedium',
              }}
            >
              edit_calendar
            </Icon>
          </IconButton>
          <IconButton>
            <StopCircle
              titleAccess={t('Stop Transfer')}
              sx={{ color: 'error.main' }}
              onClick={() => {
                handleDeleteModalOpen(row);
              }}
            />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            title={t('Add Stop Date') as string}
            onClick={(event) => {
              event.stopPropagation();
              handleCalendarOpen(row);
            }}
          >
            <Icon
              className="material-symbols-outlined"
              sx={{
                fontSize: 24,
                color: 'cruGrayMedium',
              }}
            >
              calendar_add_on
            </Icon>
          </IconButton>
          <IconButton>
            <StopCircle
              titleAccess={t('Stop Transfer')}
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
