import React, { useMemo, useState } from 'react';
import {
  ArrowForward,
  Download,
  Edit,
  ErrorOutline,
  EventRepeat,
  FilterList,
  Groups,
  Inventory,
  MoreHoriz,
  PauseCircleFilled,
  RepeatOne,
  Replay,
  SaveAlt,
  Savings,
  TableRows,
  Undo,
  ViewColumn,
  Wallet,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { Status } from '../Helper/TransferHistoryEnum';
import { TransferHistory } from '../SavingsFundTransfer';

type RenderCell = GridColDef<TransferHistoryRow>['renderCell'];

export interface TransferHistoryTableProps {
  history: TransferHistory[];
  emptyPlaceholder: React.ReactElement;
  loading?: boolean;
}

export const StyledGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface TransferHistoryRow {
  id: string;
  transfers: string;
  amount: number;
  schedule: string;
  status: string;
  transferDate: string;
  stopDate: string;
  note: string;
  actions: string;
}

export const CreateTransferHistoryRows = (
  history: TransferHistory,
  index: number,
): TransferHistoryRow => ({
  id: index.toString(),
  transfers: history.transfers,
  amount: history.amount,
  schedule: history.schedule,
  status: history.status,
  transferDate: history.transferDate,
  stopDate: history.stopDate,
  note: history.note,
  actions: history.actions,
});

export const TransferHistoryTable: React.FC<TransferHistoryTableProps> = ({
  history,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [pageSize, setPageSize] = useState(5);

  const transferHistoryRows = useMemo(() => {
    return history.map((data, index) => CreateTransferHistoryRows(data, index));
  }, [history]);

  const transfers: RenderCell = ({ row }) => {
    const staffAccount = (
      <Wallet
        sx={{
          backgroundColor: '#F08020',
          color: 'primary.contrastText',
          borderRadius: 1,
          p: 0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1,
        }}
      />
    );
    const staffSavings = (
      <Savings
        sx={{
          backgroundColor: '#007890',
          color: 'primary.contrastText',
          borderRadius: 1,
          p: 0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1,
        }}
      />
    );
    const staffConferenceSavings = (
      <Groups
        sx={{
          backgroundColor: '#00C0D8',
          color: 'primary.contrastText',
          borderRadius: 1,
          p: 0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1,
        }}
      />
    );

    if (row.transfers === 'staffAccount to staffSavings') {
      return (
        <>
          {staffAccount}
          <ArrowForward sx={{ mr: 1 }} />
          {staffSavings}
        </>
      );
    } else if (row.transfers === 'staffAccount to staffConferenceSavings') {
      return (
        <>
          {staffAccount}
          <ArrowForward sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </>
      );
    } else if (row.transfers === 'staffSavings to staffAccount') {
      return (
        <>
          {staffSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffAccount}
        </>
      );
    } else if (row.transfers === 'staffSavings to staffConferenceSavings') {
      return (
        <>
          {staffSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </>
      );
    } else if (row.transfers === 'staffConferenceSavings to staffAccount') {
      return (
        <>
          {staffConferenceSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffAccount}
        </>
      );
    } else if (row.transfers === 'staffConferenceSavings to staffSavings') {
      return (
        <>
          {staffConferenceSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffSavings}
        </>
      );
    }

    return (
      <Tooltip title={t(row.transfers)}>
        <Typography variant="body2" noWrap>
          {row.transfers}
        </Typography>
      </Tooltip>
    );
  };

  const amount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.amount.toLocaleString(locale, {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
    );
  };

  const schedule: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.schedule}
      </Typography>
    );
  };

  const status: RenderCell = ({ row }) => {
    if (row.status === Status.Pending) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#FFC107' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: '#FFF8E1', boxShadow: 'none' }}
        />
      );
    } else if (row.status === Status.Ongoing) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#2196F3' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: '#E3F2FD', boxShadow: 'none' }}
        />
      );
    } else if (row.status === Status.Complete) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#4CAF50' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: '#E8F5E9', boxShadow: 'none' }}
        />
      );
    } else if (row.status === Status.Ended) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#BDBDBD' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: alpha('#00000014', 0.08), boxShadow: 'none' }}
        />
      );
    } else if (row.status === Status.Failed) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#F44336' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: '#FEEBEE', boxShadow: 'none' }}
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
          ? DateTime.fromISO(row.transferDate).toLocaleString(DateTime.DATE_MED)
          : t('N/A')}
      </Typography>
    );
  };

  const stopDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.stopDate
          ? DateTime.fromISO(row.stopDate).toLocaleString(DateTime.DATE_MED)
          : t('')}
      </Typography>
    );
  };

  const note: RenderCell = ({ row }) => {
    return (
      <Tooltip title={t(row.note)}>
        <Typography variant="body2" noWrap>
          {row.note}
        </Typography>
      </Tooltip>
    );
  };

  const actions: RenderCell = ({ row }) => {
    if (row.actions === 'dropdown') {
      return (
        <>
          <IconButton onClick={handleClick}>
            <MoreHoriz />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>
              <Undo sx={{ mr: 1 }} />
              {t('Undo Transfer')}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <RepeatOne sx={{ mr: 1 }} />
              {t('Repeat Transfer')}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <EventRepeat sx={{ mr: 1 }} />
              {t('Convert to Monthly')}
            </MenuItem>
            <MenuItem onClick={handleClick}>
              <Inventory sx={{ mr: 1 }} />
              {t('Archive')}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ErrorOutline sx={{ mr: 1 }} />
              {t('View Error')}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Download sx={{ mr: 1 }} />
              {t('Download')}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Replay sx={{ mr: 1 }} />
              {t('Retry Transfer')}
            </MenuItem>
          </Menu>
        </>
      );
    } else if (row.actions === 'edit-pause') {
      return (
        <>
          <IconButton>
            <Edit />
          </IconButton>
          <IconButton>
            <PauseCircleFilled />
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

  const columns: GridColDef[] = [
    {
      field: 'transfers',
      headerName: t('Transfers'),
      width: 150,
      renderCell: transfers,
    },
    {
      field: 'amount',
      headerName: t('Amount'),
      width: 150,
      renderCell: amount,
    },
    {
      field: 'schedule',
      headerName: t('Schedule'),
      width: 150,
      renderCell: schedule,
    },
    {
      field: 'status',
      headerName: t('Status'),
      width: 150,
      renderCell: status,
    },
    {
      field: 'transferDate',
      headerName: t('Transfer Date'),
      width: 150,
      renderCell: transferDate,
    },
    {
      field: 'stopDate',
      headerName: t('Stop Date'),
      width: 150,
      renderCell: stopDate,
    },
    {
      field: 'note',
      headerName: t('Note'),
      width: 150,
      renderCell: note,
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      width: 150,
      renderCell: actions,
    },
  ];

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const QuickFilterToolbar = () => (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', gap: 0 }}>
        <Button>
          <ViewColumn sx={{ color: '#05699B', mr: 0.5 }} />
          {t('Columns').toUpperCase()}
        </Button>
        <Button>
          <FilterList sx={{ color: '#05699B', mr: 0.5 }} />
          {t('Filters').toUpperCase()}
        </Button>
        <Button>
          <TableRows sx={{ color: '#05699B', mr: 0.5 }} />
          {t('Density').toUpperCase()}
        </Button>
        <Button>
          <SaveAlt sx={{ color: '#05699B', mr: 0.5 }} />
          {t('Export').toUpperCase()}
        </Button>
      </Box>
      <GridToolbarQuickFilter
        sx={{
          width: 250,
          m: 1,
        }}
      />
    </GridToolbarContainer>
  );

  return loading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : history.length ? (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h6" mb={1}>
          {t('Transfer History')}
        </Typography>
      </Box>
      <StyledGrid
        rows={transferHistoryRows || []}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        onSortModelChange={(size) => setSortModel(size)}
        rowsPerPageOptions={[5, 10, 25]}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
        disableSelectionOnClick
        pagination
        components={{
          Toolbar: QuickFilterToolbar,
        }}
      />
    </>
  ) : (
    emptyPlaceholder
  );
};
