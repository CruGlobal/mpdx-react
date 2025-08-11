import React, { useContext } from 'react';
import { Box, Container, Typography } from '@mui/material';
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
import { mockData } from '../mockData';
import { ScreenOnly } from '../styledComponents';

interface TransfersPageProps {
  title: string;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ title }) => {
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;
  return (
              <TransferHistoryTable
                history={mockData.history}
                emptyPlaceholder={
                  <EmptyTable
                    title={t('Transfer History not available')}
                    subtitle={t('No data found across any accounts.')}
                  />
                }
              />
      </Box>
    </Box>
  );
};
