import React, { useContext, useState } from 'react';
import { Groups, Savings, Wallet } from '@mui/icons-material';
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
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';
import { BalanceCard } from '../BalanceCard/BalanceCard';
import { EmptyTable } from '../Table/EmptyTable';
import { PrintTable } from '../Table/PrintTable';
import { TransferHistoryTable } from '../Table/TransferHistoryTable';
import {
  TransferModal,
  TransferModalData,
  TransferTypeEnum,
} from '../TransferModal/TransferModal';
import { StaffSavingFund, mockData } from '../mockData';

export interface HandleOpenTransferModalProps {
  accountTransferFromId?: TransferModalData['accountTransferFromId'];
  accountTransferToId?: TransferModalData['accountTransferToId'];
}

interface SavingsFundTransfersProps {
  title: string;
}

const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

export const PrintOnly = styled(Box)({
  display: 'none',
  '@media print': {
    display: 'block',
  },
});

export const ScreenOnly = styled(Box)({
  '@media print': {
    display: 'none',
  },
});

export const SavingsFundTransfers: React.FC<SavingsFundTransfersProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const [modalData, setModalData] = useState<TransferModalData | null>(null);
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const handlePrint = () => window.print();

  const handleOpenTransferModal = ({
    accountTransferFromId,
    accountTransferToId,
  }: HandleOpenTransferModalProps) => {
    setModalData({
      title: t('New Transfer'),
      type: TransferTypeEnum.New,
      accountTransferFromId,
      accountTransferToId,
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
        }}
      />
      <Box>
        <ScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={t(title)}
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
              <Typography>{mockData.accountName}</Typography>
              <Typography>{mockData.accountListId}</Typography>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {mockData.funds.map((fund) => (
                <BalanceCard
                  key={fund.accountId}
                  title={`${fund.name} Balance`}
                  icon={
                    fund.type === StaffSavingFund.StaffAccount
                      ? Wallet
                      : fund.type === StaffSavingFund.StaffConferenceSavings
                      ? Groups
                      : Savings
                  }
                  iconBgColor={
                    fund.type === StaffSavingFund.StaffAccount
                      ? '#F08020'
                      : fund.type === StaffSavingFund.StaffConferenceSavings
                      ? '#00C0D8'
                      : '#007890'
                  }
                  balance={fund.balance}
                  pending={fund.pending}
                  handleOpenTransferModal={handleOpenTransferModal}
                />
              ))}
            </Box>
            <ScreenOnly sx={{ mt: 2, mb: 3 }}>
              <TransferHistoryTable
                history={mockData.history}
                funds={mockData.funds}
                emptyPlaceholder={
                  <EmptyTable
                    title={t('Transfer History not available')}
                    subtitle={t('No data found across any accounts.')}
                  />
                }
              />
            </ScreenOnly>
            <PrintOnly>
              <PrintTable transfers={mockData.history} />
            </PrintOnly>
          </Container>
        </Box>
        {modalData && (
          <TransferModal
            handleClose={() => setModalData(null)}
            data={modalData}
          />
        )}
      </Box>
    </>
  );
};
