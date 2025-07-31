import React, { useContext, useState } from 'react';
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
import { TransferHistoryTable } from '../Table/TransferHistory';
import {
  TransferModal,
  TransferModalData,
} from '../TransferModal/TransferModal';
import { mockData } from '../mockData';

export interface HandleOpenTransferModalProps {
  transferFrom?: TransferModalData['transferFrom'];
  transferTo?: TransferModalData['transferTo'];
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
    transferFrom,
    transferTo,
  }: HandleOpenTransferModalProps) => {
    setModalData({
      transferFrom,
      transferTo,
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
                fund={fund}
                key={fund.accountId}
                handleOpenTransferModal={handleOpenTransferModal}
              />
            ))}
          </Box>
          <Box sx={{ mt: 2, mb: 3 }}>
            <TransferHistoryTable
              history={mockData.history}
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
          transfer={modalData}
          funds={mockData.funds}
        />
      )}
    </Box>
  );
};
