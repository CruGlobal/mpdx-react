import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { ScheduleEnum, TransferTypeEnum } from '../Helper/TransferHistoryEnum';
import { DynamicDeleteTransferModal } from '../TransferActionsModal/DynamicDeleteTransferModal';
import { TransferModalData } from '../TransferModal/TransferModal';
import { TransferHistory } from '../mockData';
import { LoadingBox, LoadingIndicator, StyledGrid } from '../styledComponents';
import { CustomToolbar } from './CustomToolbar';
import { populateTransferHistoryRows } from './Row/createTableRow';

export type RenderCell = GridColDef<TransferHistory>['renderCell'];

export interface TransferHistoryTableProps {
  history: TransferHistory[];
  emptyPlaceholder: React.ReactElement;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
  loading?: boolean;
}

export const CreateTransferHistoryRows = (
  history: TransferHistory,
): TransferHistory => ({
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

  const transferHistoryRows = useMemo(() => {
    return history.map((data) => CreateTransferHistoryRows(data));
  }, [history]);

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

  return (
    <>
      {loading && !history && (
        <LoadingBox>
          <LoadingIndicator
            data-testid="loading-spinner"
            color="primary"
            size={50}
          />
        </LoadingBox>
      )}

      {!loading && history ? (
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
            <DynamicDeleteTransferModal
              handleClose={() => setOpenDeleteModal(null)}
              transfer={openDeleteModal}
            />
          )}
        </>
      ) : (
        emptyPlaceholder
      )}
    </>
  );
};
