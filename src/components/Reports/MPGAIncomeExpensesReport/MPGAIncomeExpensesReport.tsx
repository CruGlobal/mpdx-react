import React, { useMemo, useState } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  GlobalStyles,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useStaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import { AccountInfoBox } from '../../HrTools/Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../../HrTools/Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { SettingsButtonGroup } from '../Shared/SettingsButtonGroup/SettingsButtonGroup';
import {
  Filters,
  SettingsDialog,
} from '../Shared/SettingsDialog/SettingsDialog';
import { ViewOnlyBanner } from '../Shared/ViewOnlyBanner/ViewOnlyBanner';
import { DateRange } from '../StaffExpenseReport/Helpers/StaffReportEnum';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { PrintOnlyReport } from './DisplayModes/PrintOnlyReport';
import { ScreenOnlyReport } from './DisplayModes/ScreenOnlyReport';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { FundTypes } from './Helper/MPGAReportEnum';
import { useMPGAIncomeExpenses } from './MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { PrintOnly, StyledHeaderBox } from './styledComponents';

const isDateFilterActive = (filters: Filters | null | undefined): boolean =>
  Boolean(
    filters &&
      (filters.selectedDateRange === DateRange.YearToDate ||
        (filters.selectedYear !== null && filters.selectedYear !== undefined)),
  );

interface MPGAIncomeExpensesReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    filters,
    setFilters,
    startDate,
    endDate,
    subtitle,
    transactionYears,
    staffName,
    isSupervisorView,
    staffAccountId,
    dataLoading,
    reportError,
    refetchReport,
  } = useMPGAIncomeExpenses();

  const defaultFilters: Filters = useMemo(
    () => ({
      selectedDateRange: null,
      startDate,
      endDate,
      categories: null,
    }),
    [startDate, endDate],
  );

  const isFilterActive = isDateFilterActive(filters);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { data: staffAccountData, error } = useStaffAccountQuery({
    skip: isSupervisorView,
  });

  const accountName = isSupervisorView
    ? staffName
    : staffAccountData?.staffAccount?.name;
  const isAccountInfoLoading = isSupervisorView
    ? dataLoading
    : !staffAccountData && !error;

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            '.MuiSvgIcon-root': {
              display: 'inline !important',
              visibility: 'visible !important',
              width: '24px',
              height: '24px',
            },
          },
          '@page': {
            size: 'landscape',
          },
        }}
      />
      <Box>
        <SimpleScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={title}
          />
        </SimpleScreenOnly>
        {isSupervisorView && (
          <ViewOnlyBanner staffName={staffName} reportName={t('MPGA')} />
        )}
        <Box mt={2}>
          <Container>
            <StyledHeaderBox>
              <SimpleScreenOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis')}
                </Typography>
              </SimpleScreenOnly>
              <SimplePrintOnly>
                <Typography variant="h4">
                  {t('Income & Expenses Analysis: {{subtitle}}', { subtitle })}
                </Typography>
              </SimplePrintOnly>
              <SimpleScreenOnly
                display="flex"
                alignItems="center"
                sx={{ gap: 2, '& > button': { ml: 0 } }}
              >
                <SettingsButtonGroup
                  isFilterDateSelected={isFilterActive}
                  setFilters={setFilters}
                  handleSettingsClick={handleSettingsClick}
                />
                <Divider orientation="vertical" flexItem />
                <ExportCsvButton />
                <StyledPrintButton
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PrintIcon />
                    </SvgIcon>
                  }
                  onClick={handlePrint}
                  disabled={Boolean(reportError)}
                >
                  {t('Print')}
                </StyledPrintButton>
              </SimpleScreenOnly>
            </StyledHeaderBox>
            {isAccountInfoLoading ? (
              <AccountInfoBoxSkeleton />
            ) : (
              // A supervisor's staff name comes from the failed report, so there is no name to show
              !(isSupervisorView && reportError) && (
                <AccountInfoBox name={accountName} />
              )
            )}
          </Container>
        </Box>
        {reportError ? (
          // The global Apollo error link already shows the error details in a snackbar
          <Container sx={{ mt: 2 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={refetchReport}>
                  {t('Try Again')}
                </Button>
              }
            >
              {t(
                'The Income & Expenses report could not be loaded. Please try again later.',
              )}
            </Alert>
          </Container>
        ) : (
          <>
            <SimpleScreenOnly>
              <ScreenOnlyReport />
            </SimpleScreenOnly>
            <PrintOnly>
              <PrintOnlyReport />
            </PrintOnly>
          </>
        )}
      </Box>
      {isSettingsOpen && (
        <SettingsDialog
          selectedFilters={filters ?? defaultFilters}
          selectedFundType={FundTypes.Primary}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            const hasActiveFilter =
              Boolean(newFilters?.categories) || isDateFilterActive(newFilters);
            setFilters(hasActiveFilter && newFilters ? newFilters : null);
            setIsSettingsOpen(false);
          }}
          isMpgaReport
          staffAccountId={staffAccountId}
          transactionYears={transactionYears ?? []}
        />
      )}
    </>
  );
};
