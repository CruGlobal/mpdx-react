import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  LoadingBox,
  LoadingIndicator,
} from 'src/components/Shared/styledComponents/LoadingStyling';
import { useLocale } from 'src/hooks/useLocale';
import { CustomEditCalendar } from '../CustomEditCalendar/CustomEditCalendar';
import { DynamicDeleteTransferModal } from '../DeleteTransferModal/DynamicDeleteTransferModal';
import { DynamicFailedTransferModal } from '../FailedTransferModal/DynamicFailedTransferModal';
import { useUpdateRecurringTransferMutation } from '../TransferMutations.generated';
import {
  ActionTypeEnum,
  ScheduleEnum,
  StatusEnum,
  TableTypeEnum,
  TransferModalData,
  TransferTypeEnum,
  Transfers,
} from '../mockData';
import { StyledFundDataGrid } from '../styledComponents/StyledFundDataGrid';
import { CustomToolbar } from './CustomToolbar';
import { populateTransferRows } from './Row/createTableRow';

type CalendarType = { row: Transfers; actionType: ActionTypeEnum };

export type RenderCell = GridColDef<Transfers>['renderCell'];

export const CreateTransferRows = (history: Transfers): Transfers => ({
  id: history.id ?? crypto.randomUUID(),
  transferFrom: history.transferFrom,
  transferTo: history.transferTo,
  amount: history.amount,
  schedule: history.schedule ?? ScheduleEnum.OneTime,
  status: history.status ?? StatusEnum.Pending,
  transferDate: history.transferDate,
  endDate: history.endDate ?? null,
  note: history.note ?? '',
  actions: history.actions ?? '',
  recurringId: history.recurringId ?? '',
  failedCount: history.failedCount,
  baseAmount: history.baseAmount,
  summarizedTransfers: history.summarizedTransfers ?? null,
  missingMonths: history.missingMonths ?? null,
});

const createToolbar = (history: Transfers[], type: TableTypeEnum) => {
  const Toolbar = () => <CustomToolbar history={history} type={type} />;
  Toolbar.displayName = 'TransferHistoryTableCustomToolbar';
  return Toolbar;
};

export interface TransfersTableProps {
  history: Transfers[];
  type: TableTypeEnum;
  emptyPlaceholder: React.ReactElement;
  handleOpenTransferModal: ({ type, transfer }: TransferModalData) => void;
  loading?: boolean;
}
export const TransfersTable: React.FC<TransfersTableProps> = ({
  history,
  type,
  emptyPlaceholder,
  handleOpenTransferModal,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();

  const [updateRecurringTransfer] = useUpdateRecurringTransferMutation({
    refetchQueries: ['ReportsSavingsFundTransfer', 'ReportsStaffExpenses'],
    awaitRefetchQueries: true,
  });

  const [openFailedModal, setOpenFailedModal] = useState<Transfers | null>(
    null,
  );

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [calendarRow, setCalendarRow] = useState<Transfers | null>(null);
  const [calendarDate, setCalendarDate] = useState<DateTime | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState<Transfers | null>(
    null,
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const handleFailedTransferOpen = (transfer: Transfers) => {
    setOpenFailedModal(transfer);
  };

  const handleFailedTransferClose = () => {
    setOpenFailedModal(null);
  };

  const handleDeleteModalOpen = (transfer: Transfers) => {
    setOpenDeleteModal(transfer);
  };

  const handleEditModalOpen = (transfer: Transfers) => {
    handleOpenTransferModal({
      type: TransferTypeEnum.Edit,
      transfer,
    });
  };

  const handleCalendarOpen = (transfer: Transfers) => {
    setCalendarType({
      row: transfer,
      actionType: transfer.endDate ? ActionTypeEnum.Edit : ActionTypeEnum.Add,
    });
    setCalendarRow(transfer);
    setCalendarDate(transfer.endDate ?? null);
    setCalendarOpen(true);
  };

  const handleCalendarClose = () => {
    setCalendarOpen(false);
    setCalendarType(null);
  };

  const handleAcceptCalendar = async (
    date: DateTime | null,
    actionType: ActionTypeEnum,
  ) => {
    const successMessage =
      actionType === ActionTypeEnum.Edit
        ? t('Stop date updated successfully')
        : t('Stop date added successfully');
    const errorMessage =
      actionType === ActionTypeEnum.Edit
        ? t('Failed to update stop date')
        : t('Failed to add stop date');
    try {
      if (calendarRow) {
        const recurringEnd: string | null = date ? date.toISO() : null;
        await updateRecurringTransfer({
          variables: {
            id: calendarRow.recurringId ?? '',
            recurringEnd: recurringEnd,
          },
        });

        enqueueSnackbar(successMessage, {
          variant: 'success',
        });
      }
    } catch (error) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    }
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
  } = populateTransferRows({
    type,
    handleEditModalOpen,
    handleDeleteModalOpen,
    handleCalendarOpen,
    handleFailedTransferOpen,
    t,
    locale,
  });

  const transferRows = history.map(CreateTransferRows);

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
      width: 100,
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
          {type === TableTypeEnum.History
            ? t('Transfer History')
            : t('Upcoming Transfers')}
        </Typography>
      </Box>
      <StyledFundDataGrid
        rows={transferRows.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize,
        )}
        rowCount={transferRows.length}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        onSortModelChange={(size) => setSortModel(size)}
        pageSizeOptions={[5, 10, 25, 50]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        autoHeight
        disableRowSelectionOnClick
        disableVirtualization
        showToolbar
        slots={{
          toolbar: createToolbar(history, type),
        }}
      />
      <CustomEditCalendar
        open={calendarOpen}
        onClose={handleCalendarClose}
        onAccept={(date) => {
          if (calendarType) {
            handleAcceptCalendar(date, calendarType.actionType);
          }
          handleCalendarClose();
        }}
        minDate={calendarRow?.transferDate ?? undefined}
        value={calendarDate}
        onChange={(newValue) => setCalendarDate(newValue)}
        type={calendarType?.actionType}
      />
      {openDeleteModal && (
        <DynamicDeleteTransferModal
          handleClose={() => setOpenDeleteModal(null)}
          transfer={openDeleteModal}
          type={
            type === TableTypeEnum.History
              ? ActionTypeEnum.Stop
              : ActionTypeEnum.Cancel
          }
        />
      )}
      {openFailedModal && (
        <DynamicFailedTransferModal
          handleClose={handleFailedTransferClose}
          transfer={openFailedModal}
        />
      )}
    </>
  ) : (
    emptyPlaceholder
  );
};
