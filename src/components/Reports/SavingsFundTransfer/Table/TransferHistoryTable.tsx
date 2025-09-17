import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  LoadingBox,
  LoadingIndicator,
} from 'src/components/Shared/styledComponents/LoadingStyling';
import { useLocale } from 'src/hooks/useLocale';
import { DynamicDeleteTransferModal } from '../DeleteTransferModal/DynamicDeleteTransferModal';
import {
  ScheduleEnum,
  TransferHistory,
  TransferModalData,
  TransferTypeEnum,
} from '../mockData';
import { StyledFundDataGrid } from '../styledComponents/StyledFundDataGrid';
import { CustomToolbar } from './CustomToolbar';
import { populateTransferHistoryRows } from './Row/createTableRow';

export type RenderCell = GridColDef<TransferHistory>['renderCell'];

export const CreateTransferHistoryRows = (
  history: TransferHistory,
): TransferHistory => ({
  id: history.id || crypto.randomUUID(),
  transferFrom: history.transferFrom || '',
  transferTo: history.transferTo || '',
  amount: history.amount || 0,
  schedule: history.schedule || ScheduleEnum.OneTime,
  status: history.status || undefined,
  transferDate: history.transferDate || null,
  endDate: history.endDate || null,
  note: history.note || '',
  actions: history.actions || '',
  recurringId: history.recurringId || '',
});

const createToolbar = (history: TransferHistory[]) => {
  const Toolbar = () => <CustomToolbar history={history} />;
  Toolbar.displayName = 'TransferHistoryTableCustomToolbar';
  return Toolbar;
};

export interface TransferHistoryTableProps {
  history: TransferHistory[];
  emptyPlaceholder: React.ReactElement;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
  loading?: boolean;
}
export const TransferHistoryTable: React.FC<TransferHistoryTableProps> = ({
  history,
  emptyPlaceholder,
  handleOpenTransferModal,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [openDeleteModal, setOpenDeleteModal] =
    useState<TransferHistory | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const handleDeleteModalOpen = (transfer: TransferHistory) => {
    setOpenDeleteModal(transfer);
  };

  const handleEditModalOpen = (transfer: TransferHistory) => {
    handleOpenTransferModal({
      type: TransferTypeEnum.Edit,
      transfer,
    });
  };

  const {
    transfers,
    amount,
    schedule,
    status,
    transferDate,
    endDate,
    note,
    actions,
  } = populateTransferHistoryRows(
    handleEditModalOpen,
    handleDeleteModalOpen,
    t,
    locale,
  );

  const transferHistoryRows = history.map(CreateTransferHistoryRows);

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

  if (loading && !history.length) {
    return (
      <LoadingBox>
        <LoadingIndicator
          data-testid="loading-spinner"
          color="primary"
          size={50}
        />
      </LoadingBox>
    );
  }

  return history?.length ? (
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
      <StyledFundDataGrid
        rows={transferHistoryRows.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize,
        )}
        rowCount={transferHistoryRows.length}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        onSortModelChange={(size) => setSortModel(size)}
        pageSizeOptions={[5, 10, 25, 100]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        autoHeight
        disableRowSelectionOnClick
        disableVirtualization
        showToolbar
        slots={{
          toolbar: createToolbar(history),
        }}
      />
      {openDeleteModal && (
        <DynamicDeleteTransferModal
          handleClose={() => setOpenDeleteModal(null)}
          transfer={openDeleteModal}
        />
      )}
    </>
  ) : (
    emptyPlaceholder
  );
};
