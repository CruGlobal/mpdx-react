import React from 'react';
import { Box, Typography, styled, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
  empty: boolean;
}

const HeaderWrapper = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 24,
}));

const ProgressBarWrapper = styled(Box)(({}) => ({
  width: 450,
  display: 'flex',
  flexDirection: 'row',
  height: 35,
  border: '2px solid inherit',
  borderRadius: 30,
  overflow: 'hidden',
}));

const ProgressBarSection = styled(Box)(({}) => ({
  height: '100%',
  textAlign: 'center',
  color: 'white',
  flexGrow: 1,
}));

export const ExpectedMonthlyTotalReportHeader: React.FC<Props> = ({
  accountListId,
  empty,
}) => {
  const { t } = useTranslation();
  return (
    <Box>
      <HeaderWrapper>
        <Typography variant="h4">{t('Expected Monthly Total')}</Typography>
        {empty === false ? (
          <ProgressBarWrapper>
            <ProgressBarSection
              style={{ backgroundColor: '#f9b625', width: '36%' }}
            >
              <Typography style={{ marginTop: 4 }}>{t('Received')}</Typography>
            </ProgressBarSection>
            <ProgressBarSection
              style={{ backgroundColor: '#dd7d1a', width: '50%' }}
            >
              <Typography style={{ marginTop: 4 }}>{t('Likely')}</Typography>
            </ProgressBarSection>
            <ProgressBarSection
              style={{ backgroundColor: '#808080', width: '24%' }}
            >
              <Typography style={{ marginTop: 4 }}>{t('Possible')}</Typography>
            </ProgressBarSection>
          </ProgressBarWrapper>
        ) : null}
      </HeaderWrapper>
      <Divider style={{ marginBottom: 8 }} variant="middle"></Divider>
    </Box>
  );
};
