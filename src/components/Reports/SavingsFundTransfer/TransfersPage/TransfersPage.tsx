import React, { useContext, useMemo, useState } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  GlobalStyles,
  SvgIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useFilteredTransfers } from 'src/hooks/useFilteredTransfers';
import theme from 'src/theme';
import { useStaffAccountQuery } from '../../StaffAccount.generated';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';
import { BalanceCard } from '../BalanceCard/BalanceCard';
import { getStatusLabel } from '../Helper/getStatus';
import {
  useReportsSavingsFundTransferQuery,
  useReportsStaffExpensesQuery,
} from '../ReportsSavingsFund.generated';
import { EmptyTable } from '../Table/EmptyTable';
import { PrintTable } from '../Table/PrintTable';
import { TransfersTable } from '../Table/TransfersTable';
import { DynamicTransferModal } from '../TransferModal/DynamicTransferModal';
import { UpdatedAtProvider } from '../UpdatedAtContext/UpdateAtContext';
import {
  FundTypeEnum,
  ScheduleEnum,
  StatusEnum,
  TableTypeEnum,
  Transactions,
  TransferModalData,
  Transfers,
  incomingTransfers,
} from '../mockData';
import { PrintOnly, ScreenOnly } from '../styledComponents/DisplayStyling';

const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

interface TransfersPageProps {
  title: string;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ title }) => {
  const { t } = useTranslation();
  const [modalData, setModalData] = useState<TransferModalData | null>(null);
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const { data: staffAccountData } = useStaffAccountQuery();

  const { data: reportData, loading: reportLoading } =
    useReportsSavingsFundTransferQuery();
  const { data: fundsData, loading: fundsLoading } =
    useReportsStaffExpensesQuery({
      variables: {
        fundTypes: [FundTypeEnum.Primary, FundTypeEnum.Savings],
      },
    });

  const funds = useMemo(
    () =>
      (fundsData?.reportsStaffExpenses?.funds ?? []).toSorted((a, b) =>
        a.id.localeCompare(b.id),
      ),
    [fundsData],
  );

  const transactions: Transactions[] = useMemo(
    () =>
      (reportData?.reportsSavingsFundTransfer ?? []).map((tx) => {
        return {
          ...tx,
          transactedAt: DateTime.fromISO(tx.transactedAt),
          recurringTransfer: tx.recurringTransfer
            ? {
                ...tx.recurringTransfer,
                recurringStart: tx.recurringTransfer.recurringStart
                  ? DateTime.fromISO(tx.recurringTransfer.recurringStart)
                  : null,
                recurringEnd: tx.recurringTransfer.recurringEnd
                  ? DateTime.fromISO(tx.recurringTransfer.recurringEnd)
                  : null,
              }
            : null,
          baseAmount: tx.amount || 0,
          failedStatus: false,
          failedCount: 0,
        };
      }),
    [reportData],
  );

  const filteredTransactions = useFilteredTransfers(transactions);

  const transferHistory: Transfers[] = filteredTransactions.map((tx) => {
    const isRecurring = !!tx.recurringTransfer;
    const status = tx.failedStatus ? StatusEnum.Failed : getStatusLabel(tx);
    const shouldShowActions = () => {
      if (status === StatusEnum.Pending || status === StatusEnum.Ongoing) {
        return false;
      }
      return true;
    };

    return {
      id: tx.id || crypto.randomUUID(),
      transferFrom: tx.transfer.sourceFundTypeName || '',
      transferTo: tx.transfer.destinationFundTypeName || '',
      amount: tx.amount || 0,
      schedule: isRecurring ? ScheduleEnum.Monthly : ScheduleEnum.OneTime,
      status: status || undefined,
      transferDate: tx.failedStatus
        ? tx.transactedAt
        : isRecurring
          ? tx.recurringTransfer?.recurringStart || null
          : tx.transactedAt || null,
      endDate: tx.recurringTransfer?.recurringEnd || null,
      note: tx.subCategory.name || '',
      actions: shouldShowActions() === false ? 'edit-delete' : '',
      recurringId: tx.recurringTransfer?.id || '',
      baseAmount: tx.baseAmount || 0,
      failedCount: tx.failedCount || 0,
    };
  });

  const incoming = incomingTransfers;

  const handlePrint = () => window.print();

  const handleOpenTransferModal = ({ type, transfer }: TransferModalData) => {
    setModalData({
      type,
      transfer,
    });
  };

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            'svg, .MuiSvgIcon-root': {
              display: 'inline !important',
              visibility: 'visible !important',
              width: '24px',
              height: '24px',
            },
          },
          '@page': {
            size: 'landscape',
          },
        }}
      />
      <UpdatedAtProvider storageKey="fundsUpdatedAt">
        <Box>
          <ScreenOnly>
            <MultiPageHeader
              isNavListOpen={isNavListOpen}
              onNavListToggle={onNavListToggle}
              headerType={HeaderTypeEnum.Report}
              title={title}
            />
          </ScreenOnly>
          <Box sx={{ mt: 2 }}>
            <Container>
              <StyledHeaderBox>
                <Typography variant="h4">{t('Fund Transfer')}</Typography>
                <ScreenOnly
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <StyledPrintButton
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PrintIcon titleAccess={t('Print')} />
                      </SvgIcon>
                    }
                    onClick={handlePrint}
                  >
                    {t('Print')}
                  </StyledPrintButton>
                </ScreenOnly>
              </StyledHeaderBox>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  mb: 2,
                }}
              >
                <Typography>{staffAccountData?.staffAccount?.name}</Typography>
                <Typography>{staffAccountData?.staffAccount?.id}</Typography>
              </Box>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                {funds.map((fund) => (
                  <BalanceCard
                    fund={fund}
                    key={fund.id}
                    handleOpenTransferModal={handleOpenTransferModal}
                    loading={fundsLoading}
                  />
                ))}
              </Box>
              <ScreenOnly sx={{ mt: 2, mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <TransfersTable
                    history={incoming}
                    type={TableTypeEnum.Upcoming}
                    handleOpenTransferModal={handleOpenTransferModal}
                    emptyPlaceholder={
                      <EmptyTable
                        title={t('Upcoming Transfers not available')}
                        subtitle={t('No data found across any accounts.')}
                      />
                    }
                    loading={reportLoading}
                  />
                </Box>
                <TransfersTable
                  history={transferHistory}
                  type={TableTypeEnum.History}
                  handleOpenTransferModal={handleOpenTransferModal}
                  emptyPlaceholder={
                    <EmptyTable
                      title={t('Transfer History not available')}
                      subtitle={t('No data found across any accounts.')}
                    />
                  }
                  loading={reportLoading}
                />
              </ScreenOnly>
              <PrintOnly>
                <Box sx={{ my: 4 }}>
                  <PrintTable
                    transfers={incoming}
                    type={TableTypeEnum.Upcoming}
                  />
                  <PrintTable
                    transfers={transferHistory}
                    type={TableTypeEnum.History}
                  />
                </Box>
              </PrintOnly>
            </Container>
          </Box>
          {modalData && (
            <DynamicTransferModal
              handleClose={() => setModalData(null)}
              data={modalData}
              funds={funds}
            />
          )}
        </Box>
      </UpdatedAtProvider>
    </>
  );
};
