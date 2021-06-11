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
  width: 350,
  display: 'flex',
  flexDirection: 'row',
  height: 45,
  border: '2px solid white',
  borderRadius: 30,
  overflow: 'hidden',
}));

const ProgressBarSection = styled(Box)(({}) => ({
  height: '100%',
  width: '33%',
  textAlign: 'center',
  color: 'white',
  flexGrow: 1,
}));

export const ExpectedMonthlyTotalReportHeader: React.FC<Props> = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <HeaderWrapper>
        <Typography variant="h4">{t('Expected Monthly Total')}</Typography>
        <ProgressBarWrapper>
          <ProgressBarSection style={{ backgroundColor: '#fec627' }}>
            <Typography>{t('Received')}</Typography>
          </ProgressBarSection>
          <ProgressBarSection style={{ backgroundColor: '#fedb72' }}>
            <Typography>{t('Likely')}</Typography>
          </ProgressBarSection>
          <ProgressBarSection style={{ backgroundColor: '#c89a37' }}>
            <Typography>{t('Possible')}</Typography>
          </ProgressBarSection>
        </ProgressBarWrapper>
      </HeaderWrapper>
      <Divider style={{ margin: 16 }} variant="middle"></Divider>
    </Box>
  );
};
