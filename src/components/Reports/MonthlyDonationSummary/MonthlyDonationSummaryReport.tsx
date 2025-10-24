import { useMemo } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Container, SvgIcon, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { StyledHeaderBox } from '../MPGAIncomeExpensesReport/styledComponents';
import { AccountInfoBox } from '../Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { EmptyTable } from '../Shared/EmptyTable/EmptyTable';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import { SimpleScreenOnly, StyledPrintButton } from '../styledComponents';
import { MonthlyDonationTable as Table } from './Table/Table';
import { mockData } from './mockData';

interface MonthlyDonationSummaryReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MonthlyDonationSummaryReport: React.FC<
  MonthlyDonationSummaryReportProps
> = ({ isNavListOpen, onNavListToggle, title }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const { data: staffAccountData, error } = useStaffAccountQuery();

  const totalDonations = useMemo(() => {
    return mockData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [mockData]);

  return (
    <Box>
      <SimpleScreenOnly>
        <MultiPageHeader
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
          headerType={HeaderTypeEnum.Report}
          title={title}
        />
      </SimpleScreenOnly>
      <Box mt={2}>
        <Container>
          <StyledHeaderBox>
            <Typography variant="h4">{t('My Donations')}</Typography>
            <SimpleScreenOnly>
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
            </SimpleScreenOnly>
          </StyledHeaderBox>
          {!staffAccountData && !error ? (
            <AccountInfoBoxSkeleton />
          ) : (
            <AccountInfoBox
              name={staffAccountData?.staffAccount?.name}
              accountId={staffAccountData?.staffAccount?.id}
            />
          )}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {t('My Donations')}
          </Typography>
          <Table
            data={mockData}
            totalDonations={totalDonations}
            emptyPlaceholder={
              <EmptyTable
                title={t('No Donations Found')}
                subtitle={t('You have not made any donations yet.')}
                icon={LocalAtmIcon}
              />
            }
          />
        </Container>
      </Box>
    </Box>
  );
};
