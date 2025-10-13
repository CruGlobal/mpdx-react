import React, { useContext, useMemo, useState } from 'react';
import { HourglassDisabled } from '@mui/icons-material';
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
import theme from 'src/theme';
import { AccountInfoBox } from '../../Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../../Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { EmptyTable } from '../../Shared/EmptyTable/EmptyTable';
import { useStaffAccountQuery } from '../../StaffAccount.generated';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';
import { SimplePrintOnly, SimpleScreenOnly } from '../../styledComponents';
import { BalanceCard } from '../BalanceCard/BalanceCard';
import { CardSkeleton } from '../BalanceCard/CardSkeleton';
import { filteredTransfers } from '../Helper/filterTransfers';
import { getStatusLabel } from '../Helper/getStatus';
import {
  useReportsSavingsFundTransferQuery,
  useReportsStaffExpensesQuery,
} from '../ReportsSavingsFund.generated';
import { PrintTable } from '../Table/PrintTable';
import { TransfersTable } from '../Table/TransfersTable';
import { DynamicTransferModal } from '../TransferModal/DynamicTransferModal';
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

const StyledCardsBox = styled(Box)({
  flex: 1,
  minWidth: 250,
  display: 'flex',
  gap: theme.spacing(4),
});

export const TransfersPage: React.FC<TransfersPageProps> = ({ title }) => {
  const { t } = useTranslation();
  const [modalData, setModalData] = useState<TransferModalData | null>(null);
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const { data: staffAccountData, error: staffAccountError } =
    useStaffAccountQuery();

  const { data: reportData, loading: reportLoading } =
    useReportsSavingsFundTransferQuery();
  const { data: fundsData, error: fundsError } = useReportsStaffExpensesQuery({
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
          id: tx.transaction?.id ? tx.transaction.id : crypto.randomUUID(),
          amount: tx.transaction?.amount ? tx.transaction.amount : 0,
          transactedAt: tx.transaction?.transactedAt
            ? DateTime.fromISO(tx.transaction?.transactedAt, { setZone: true })
            : DateTime.now(),
          subCategory: tx.subCategory ? tx.subCategory : null,
          recurringTransfer: tx.recurringTransfer
            ? {
                ...tx.recurringTransfer,
                recurringStart: DateTime.fromISO(
                  tx.recurringTransfer.recurringStart,
                  {
                    setZone: true,
                  },
                ),
                recurringEnd: tx.recurringTransfer.recurringEnd
                  ? DateTime.fromISO(tx.recurringTransfer.recurringEnd, {
                      setZone: true,
                    })
                  : null,
              }
            : null,
          baseAmount: tx.transaction?.amount || 0,
          failedCount: 0,
          summarizedTransfers: null,
          missingMonths: null,
        };
      }),
    [reportData],
  );

  const filteredTransactions = useMemo(
    () => filteredTransfers(transactions),
    [transactions],
  );

  const transferHistory: Transfers[] = filteredTransactions.map((tx) => {
    const isRecurring = !!tx.recurringTransfer;
    const status = getStatusLabel(tx);
    const shouldShowActions = () => {
      return status !== StatusEnum.Pending && status !== StatusEnum.Ongoing;
    };

    return {
      id: tx.id || crypto.randomUUID(),
      transferFrom: tx.transfer.sourceFundTypeName,
      transferTo: tx.transfer.destinationFundTypeName,
      amount: tx.amount,
      schedule: isRecurring ? ScheduleEnum.Monthly : ScheduleEnum.OneTime,
      status: status,
      transferDate: isRecurring
        ? tx.recurringTransfer?.recurringStart
        : tx.transactedAt,
      endDate: tx.recurringTransfer?.recurringEnd || null,
      note: tx.subCategory?.name ?? 'default note',
      actions: shouldShowActions() === false ? 'edit-delete' : '',
      recurringId: tx.recurringTransfer?.id || null,
      baseAmount: tx.baseAmount,
      failedCount: tx.failedCount,
      summarizedTransfers: tx.summarizedTransfers,
      missingMonths: tx.missingMonths,
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
            '.StyledIconBox-root': {
              width: '26px',
              height: '26px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
          },
          '@page': {
            size: 'landscape',
          },
        }}
      />
      <Box>
        <SimpleScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={title}
          />
        </SimpleScreenOnly>
        <Box sx={{ mt: 2 }}>
          <Container>
            <StyledHeaderBox>
              <Typography variant="h4">{t('Fund Transfer')}</Typography>
              <SimpleScreenOnly
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
              </SimpleScreenOnly>
            </StyledHeaderBox>
            {!staffAccountData && !staffAccountError ? (
              <AccountInfoBoxSkeleton />
            ) : (
              <AccountInfoBox
                name={staffAccountData?.staffAccount?.name}
                accountId={staffAccountData?.staffAccount?.id}
              />
            )}
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {!fundsData && !fundsError ? (
                <StyledCardsBox>
                  <CardSkeleton />
                  <CardSkeleton />
                </StyledCardsBox>
              ) : (
                funds.map((fund) => (
                  <BalanceCard
                    fund={fund}
                    key={fund.id}
                    handleOpenTransferModal={handleOpenTransferModal}
                  />
                ))
              )}
            </Box>
            <SimpleScreenOnly sx={{ mt: 2, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <TransfersTable
                  history={incoming}
                  type={TableTypeEnum.Upcoming}
                  handleOpenTransferModal={handleOpenTransferModal}
                  emptyPlaceholder={
                    <EmptyTable
                      title={t('Upcoming Transfers not available')}
                      subtitle={t('No data found across any accounts.')}
                      icon={HourglassDisabled}
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
                    icon={HourglassDisabled}
                  />
                }
                loading={reportLoading}
              />
            </SimpleScreenOnly>
            <SimplePrintOnly>
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
            </SimplePrintOnly>
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
    </>
  );
};
