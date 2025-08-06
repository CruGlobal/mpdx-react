import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Container, SvgIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { CardTable } from './Tables/CardTable';
import { EmptyTable } from './Tables/EmptyTable';
import { mockData } from './mockData';

interface MPGAIncomeExpensesReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
});

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        headerType={HeaderTypeEnum.Report}
        title={title}
      />
      <Box mt={2}>
        <Container>
          <StyledHeaderBox>
            <Typography variant="h4">
              {t('Income & Expenses Analysis')}
            </Typography>
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
          </StyledHeaderBox>
          <Box display="flex" flexDirection="row" gap={3} mb={2}>
            <Typography>{mockData.accountName}</Typography>
            <Typography>{mockData.accountListId}</Typography>
          </Box>
          <Box>
            <CardTable
              data={mockData.income?.data}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Income data available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Income')}
            />
          </Box>
          <Box mt={2}>
            <CardTable
              data={mockData.ministryExpenses?.data}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Ministry Expenses available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Ministry Expenses')}
            />
          </Box>
          <Box mt={2} mb={2}>
            <CardTable
              data={mockData.healthcareExpenses?.data}
              emptyPlaceholder={
                <EmptyTable
                  title={t('No Healthcare Expenses available')}
                  subtitle={t('Data not found in the last 12 months')}
                />
              }
              title={t('Healthcare Expenses')}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
