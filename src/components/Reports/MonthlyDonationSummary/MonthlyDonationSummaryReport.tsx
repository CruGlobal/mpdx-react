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
import { useStaffAccountQuery } from '../StaffAccount.generated';
import { SimpleScreenOnly, StyledPrintButton } from '../styledComponents';

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
        </Container>
      </Box>
    </Box>
  );
};
