import React, { useContext } from 'react';
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
import { TransferHistoryTable } from '../Table/TransferHistory';
import { mockData } from '../mockData';

interface SavingsFundTransfersProps {
  title: string;
}

export const SavingsFundTransfers: React.FC<SavingsFundTransfersProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

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
            <BalanceCard
              title={t('Staff Account Balance')}
              icon={Wallet}
              iconBgColor="#F08020"
              balance={15000}
              pending={17500}
              // eslint-disable-next-line no-console
              onClick={() => console.log('Staff Savings Fund clicked')}
            />
            <BalanceCard
              title={t('Staff Conference Savings Balance')}
              icon={Groups}
              iconBgColor="#00C0D8"
              balance={500}
              pending={200}
              onClick={() =>
                // eslint-disable-next-line no-console
                console.log('Staff Conference Savings Fund clicked')
              }
            />
            <BalanceCard
              title={t('Staff Savings Balance')}
              icon={Savings}
              iconBgColor="#007890"
              balance={2500}
              pending={0}
              // eslint-disable-next-line no-console
              onClick={() => console.log('Staff Savings Fund clicked')}
            />
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
    </Box>
  );
};
