import React, { useMemo, useState } from 'react';
import { ArrowForward, Delete, Edit, SaveAlt } from '@mui/icons-material';
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
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { downloadCSV } from '../DownloadTable/downloadTable';
import {
  ScheduleEnum,
  StatusEnum,
  TransferTypeEnum,
} from '../Helper/TransferHistoryEnum';
import {
  staffAccount,
  staffConferenceSavings,
  staffSavings,
} from '../Helper/TransferIcons';
import { DeleteTransferModal } from '../TransferActionsModal/DeleteTransferModal';
import { TransferModalData } from '../TransferModal/TransferModal';
import { TransferHistory, mockData } from '../mockData';

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
  transferFrom: string;
  transferTo: string;
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
  transferFrom: history.transferFrom || '',
  transferTo: history.transferTo || '',
  amount: history.amount || 0,
  schedule: history.schedule || ScheduleEnum.OneTime,
  status: history.status || '',
  transferDate: history.transferDate || null,
  endDate: history.endDate || null,
  note: history.note || '',
  actions: history.actions || '',
});

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
    handleOpenTransferModal({
      type: TransferTypeEnum.Edit,
      transfer,
    });
  };

  const transferHistoryRows = useMemo(() => {
    return history.map((data) => CreateTransferHistoryRows(data));
  }, [history]);

  const transfers: RenderCell = ({ row }) => {
    if (
      row.transferFrom === 'staffAccount' &&
      row.transferTo === 'staffSavings'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffAccount}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffSavings}
        </Box>
      );
    } else if (
      row.transferFrom === 'staffAccount' &&
      row.transferTo === 'staffConferenceSavings'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffAccount}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </Box>
      );
    } else if (
      row.transferFrom === 'staffSavings' &&
      row.transferTo === 'staffAccount'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffSavings}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffAccount}
        </Box>
      );
    } else if (
      row.transferFrom === 'staffSavings' &&
      row.transferTo === 'staffConferenceSavings'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffSavings}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffConferenceSavings}
        </Box>
      );
    } else if (
      row.transferFrom === 'staffConferenceSavings' &&
      row.transferTo === 'staffAccount'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffConferenceSavings}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffAccount}
        </Box>
      );
    } else if (
      row.transferFrom === 'staffConferenceSavings' &&
      row.transferTo === 'staffSavings'
    ) {
      return (
        <Box sx={{ display: 'flex', ml: 1 }}>
          {staffConferenceSavings}
          <ArrowForward titleAccess="Arrow" sx={{ mr: 1 }} />
          {staffSavings}
        </Box>
      );
    }

    return (
      <Tooltip title={t('N/A')}>
        <Typography variant="body2" noWrap>
          {'N/A'}
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
    if (row.schedule === ScheduleEnum.OneTime) {
      return (
        <Typography variant="body2" noWrap>
          {t('One Time')}
        </Typography>
      );
    } else {
      return (
        <Typography variant="body2" noWrap>
          {t('Monthly')}
        </Typography>
      );
    }
  };

  const status: RenderCell = ({ row }) => {
    if (row.status === StatusEnum.Pending) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#FFC107' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{
            backgroundColor: '#FFF8E1',
            boxShadow: 'none',
            textTransform: 'capitalize',
          }}
        />
      );
    } else if (row.status === StatusEnum.Ongoing) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#2196F3' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{
            backgroundColor: '#E3F2FD',
            boxShadow: 'none',
            textTransform: 'capitalize',
          }}
        />
      );
    } else if (row.status === StatusEnum.Complete) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#4CAF50' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{
            backgroundColor: '#E8F5E9',
            boxShadow: 'none',
            textTransform: 'capitalize',
          }}
        />
      );
    } else if (row.status === StatusEnum.Ended) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#9E9E9E' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{
            backgroundColor: '#FAFAFA',
            boxShadow: 'none',
            textTransform: 'capitalize',
          }}
        />
      );
    } else if (row.status === StatusEnum.Failed) {
      return (
        <Chip
          avatar={<Avatar sx={{ bgcolor: '#F44336' }}> </Avatar>}
          label={t(row.status)}
          color="default"
          size="small"
          sx={{
            backgroundColor: '#FEEBEE',
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

  const CustomToolbar = () => (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          size="small"
          sx={{ minHeight: 33, pt: 0, pb: 0 }}
          startIcon={<SaveAlt />}
          onClick={() => downloadCSV(t, mockData.history, locale)}
        >
          {t('Export')}
        </Button>
      </GridToolbarContainer>
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
        disableVirtualization
        pagination
        components={{
          Toolbar: CustomToolbar,
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
