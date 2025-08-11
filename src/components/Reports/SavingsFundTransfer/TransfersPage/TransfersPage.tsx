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
              <BalanceCard fund={fund} key={fund.accountId} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
