import React from 'react';
import { Box, Typography, styled, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
}

const HeaderWrapper = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 16,
}));

const ProgressBarWrapper = styled(Box)(({}) => ({
  width: 300,
  display: 'flex',
  flexDirection: 'row',
  height: 30,
}));

const ProgressBarSection = styled(Box)(({}) => ({
  height: '100%',
  width: '33%',
}));
export const ExpectedMonthlyTotalReportHeader: React.FC<Props> = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <HeaderWrapper>
        <Typography variant="h4">{t('Expected Monthly Total')}</Typography>
        <ProgressBarWrapper>
          <ProgressBarSection style={{ backgroundColor: 'red' }}>
            <Typography>Received</Typography>
          </ProgressBarSection>
          <ProgressBarSection style={{ backgroundColor: 'blue' }}>
            <Typography>Likely</Typography>
          </ProgressBarSection>
          <ProgressBarSection style={{ backgroundColor: 'green' }}>
            <Typography>Possible</Typography>
          </ProgressBarSection>
        </ProgressBarWrapper>
      </HeaderWrapper>
      <Divider variant="middle"></Divider>
    </Box>
  );
};
