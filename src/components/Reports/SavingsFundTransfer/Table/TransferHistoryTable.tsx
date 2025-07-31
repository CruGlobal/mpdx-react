import React, { useMemo, useState } from 'react';
import {
  ArrowForward,
  Delete,
  Edit,
  Groups,
  SaveAlt,
  Savings,
  Wallet,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
import { DeleteTransferModal } from '../TransferActionsModal/DeleteTransferModal';
import {
  TransferModalData,
  TransferTypeEnum,
} from '../TransferModal/TransferModal';
import { ScheduleEnum, TransferHistory } from '../mockData';

type RenderCell = GridColDef<TransferHistoryRow>['renderCell'];

export interface TransferHistoryTableProps {
  history: TransferHistory[];
  emptyPlaceholder: React.ReactElement;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
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
  transfers: string | null;
  amount: number;
  schedule: ScheduleEnum;
  status: string;
  transferDate: DateTime<boolean> | null;
  endDate: DateTime<boolean> | null;
  note: string;
  actions: string;
}

export const CreateTransferHistoryRows = (
  history: TransferHistory,
): TransferHistoryRow => ({
  id: history.id || crypto.randomUUID(),
  transfers:
    history.transferFrom && history.transferTo
      ? `${history.transferFrom} to ${history.transferTo}`
      : null,
  amount: history.amount || 0,
  schedule: history.schedule || ScheduleEnum.OneTime,
  status: history.status || '',
  transferDate: history.transferDate || null,
  endDate: history.endDate || null,
  note: history.note || '',
  actions: history.actions || '',
});

const revertToTransferHistory = (
  transferHistoryRow: TransferHistoryRow,
): TransferHistory => ({
  id: transferHistoryRow.id || crypto.randomUUID(),
  transferFrom: transferHistoryRow.transfers?.split(' to ')[0] || undefined,
  transferTo: transferHistoryRow.transfers?.split(' to ')[1] || undefined,
  amount: transferHistoryRow.amount || 0,
  schedule: transferHistoryRow.schedule || undefined,
  status: transferHistoryRow.status || undefined,
  transferDate: transferHistoryRow.transferDate || null,
  endDate: transferHistoryRow.endDate || null,
  note: transferHistoryRow.note || undefined,
  actions: transferHistoryRow.actions || undefined,
});

// icon definitions
export const staffAccount = (
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
export const staffSavings = (
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
export const staffConferenceSavings = (
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

export const TransferHistoryTable: React.FC<TransferHistoryTableProps> = ({
  history,
  emptyPlaceholder,
  handleOpenTransferModal,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [pageSize, setPageSize] = useState(5);
  const [openDeleteModal, setOpenDeleteModal] =
    useState<TransferHistory | null>(null);

  const handleDeleteModalOpen = (transfer: TransferHistoryRow) => {
    setOpenDeleteModal(transfer);
  };

  const handleEditModalOpen = (transfer: TransferHistoryRow) => {
    const transferData = revertToTransferHistory(transfer);
    handleOpenTransferModal({
      type: TransferTypeEnum.Edit,
      transfer: transferData,
    });
  };

  const transferHistoryRows = useMemo(() => {
    return history.map((data) => CreateTransferHistoryRows(data));
  }, [history]);

  const transfers: RenderCell = ({ row }) => {
    if (row.transfers === 'staffAccount to staffSavings') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffAccount}
          <ArrowForward sx={{ mr: 1 }} />
          {staffSavings}
        </Box>
      );
    } else if (row.transfers === 'staffAccount to staffConferenceSavings') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffAccount}
          <ArrowForward sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </Box>
      );
    } else if (row.transfers === 'staffSavings to staffAccount') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffAccount}
        </Box>
      );
    } else if (row.transfers === 'staffSavings to staffConferenceSavings') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </Box>
      );
    } else if (row.transfers === 'staffConferenceSavings to staffAccount') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffConferenceSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffAccount}
        </Box>
      );
    } else if (row.transfers === 'staffConferenceSavings to staffSavings') {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffConferenceSavings}
          <ArrowForward sx={{ mr: 1 }} />
          {staffSavings}
        </Box>
      );
    }

    return (
      <Tooltip title={t(row.transfers || '')}>
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
          avatar={<Avatar sx={{ bgcolor: '#9E9E9E' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{ backgroundColor: '#FAFAFA', boxShadow: 'none' }}
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
          ? row.transferDate.toLocaleString(DateTime.DATE_MED)
          : t('N/A')}
      </Typography>
    );
  };

  const endDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.endDate ? row.endDate.toLocaleString(DateTime.DATE_MED) : t('N/A')}
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
    if (row.actions === 'edit-delete') {
      return (
        <>
          <IconButton>
            <Edit onClick={() => handleEditModalOpen(row)} />
          </IconButton>
          <IconButton>
            <Delete
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
      field: 'endDate',
      headerName: t('Stop Date'),
      width: 150,
      renderCell: endDate,
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
      <Box sx={{ display: 'flex', gap: 0, ml: 1 }}>
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
      {openDeleteModal && (
        <DeleteTransferModal
          handleClose={() => setOpenDeleteModal(null)}
          transfer={openDeleteModal}
        />
      )}
    </>
  ) : (
    emptyPlaceholder
  );
};
