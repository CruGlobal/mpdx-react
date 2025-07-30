import React, { useContext, useState } from 'react';
import { Groups, Savings, Wallet } from '@mui/icons-material';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';
import { BalanceCard } from '../BalanceCard/BalanceCard';
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

export const SavingsFundTransfers: React.FC<SavingsFundTransfersProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const [modalData, setModalData] = useState<TransferModalData | null>(null);
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

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
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        headerType={HeaderTypeEnum.Report}
        title={t(title)}
      />
      <Box sx={{ mt: 2 }}>
        <Container>
          <Typography variant="h4">{t('Fund Transfer')}</Typography>
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
          <Box sx={{ mt: 2, mb: 3 }}>
            <TransferHistoryTable
              history={mockData.history}
              funds={mockData.funds}
              emptyPlaceholder={
                <Typography>{t('No transfer history available')}</Typography>
              }
            />
          </Box>
        </Container>
      </Box>
      {modalData && (
        <TransferModal
          handleClose={() => setModalData(null)}
          data={modalData}
        />
      )}
    </Box>
  );
};
