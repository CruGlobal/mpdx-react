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
import { TransferHistoryTable } from '../Table/TransferHistoryTable';
import { DynamicTransferModal } from '../TransferModal/DynamicTransferModal';
import { TransferModalData } from '../TransferModal/TransferModal';
import { UpdatedAtProvider } from '../UpdatedAtContext/UpdateAtContext';
import {
  FundTypeEnum,
  ScheduleEnum,
  StatusEnum,
  Transactions,
  TransferHistory,
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
    () => fundsData?.reportsStaffExpenses?.funds ?? [],
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
        };
      }),
    [reportData],
  );

  const filteredTransactions = useFilteredTransfers(transactions);

  const transferHistory: TransferHistory[] = filteredTransactions.map((tx) => {
    const isRecurring = !!tx.recurringTransfer?.id;
    const status = getStatusLabel(tx);

    return {
      id: tx.id || crypto.randomUUID(),
      transferFrom: tx.transfer.sourceFundTypeName || '',
      transferTo: tx.transfer.destinationFundTypeName || '',
      amount: tx.amount || 0,
      schedule: isRecurring ? ScheduleEnum.Monthly : ScheduleEnum.OneTime,
      status: status || undefined,
      transferDate: isRecurring
        ? tx.recurringTransfer?.recurringStart || null
        : tx.transactedAt || null,
      endDate: tx.recurringTransfer?.recurringEnd || null,
      note: tx.subCategory.name || '',
      actions: status !== StatusEnum.Complete ? 'edit-delete' : '',
    };
  });

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
              <UpdatedAtProvider>
                {funds.map((fund) => (
                  <BalanceCard
                    fund={fund}
                    key={fund.id}
                    handleOpenTransferModal={handleOpenTransferModal}
                    loading={fundsLoading}
                  />
                ))}
              </UpdatedAtProvider>
            </Box>
            <ScreenOnly sx={{ mt: 2, mb: 3 }}>
              <TransferHistoryTable
                history={transferHistory}
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
              <PrintTable transfers={transferHistory} />
            </PrintOnly>
          </Container>
        </Box>
        <UpdatedAtProvider>
          {modalData && (
            <DynamicTransferModal
              handleClose={() => setModalData(null)}
              data={modalData}
              funds={funds}
            />
          )}
        </UpdatedAtProvider>
      </Box>
    </>
  );
};
