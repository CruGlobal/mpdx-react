import React, { useMemo, useState } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
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
import { useReport } from './ReportContext/ReportContext';
import { PrintOnly, StyledHeaderBox } from './styledComponents';

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
  } = useReport();

  const defaultFilters: Filters = useMemo(
    () => ({
      selectedDateRange: null,
      startDate,
      endDate,
      categories: null,
    }),
    [startDate, endDate],
  );

  const isFilterActive = useMemo(
    () =>
      Boolean(
        filters &&
          (filters.selectedDateRange === DateRange.YearToDate ||
            (filters.selectedYear !== null &&
              filters.selectedYear !== undefined)),
      ),
    [filters],
  );

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { data: staffAccountData, error } = useStaffAccountQuery();

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
        <SimpleScreenOnly>
          <ScreenOnlyReport />
        </SimpleScreenOnly>
        <PrintOnly>
          <PrintOnlyReport />
        </PrintOnly>
      </Box>
      {isSettingsOpen && (
        <SettingsDialog
          selectedFilters={filters ?? defaultFilters}
          selectedFundType={FundTypes.Primary}
          isOpen={isSettingsOpen}
          onClose={(newFilters) => {
            const hasActiveFilter = Boolean(
              newFilters &&
                (newFilters.categories ||
                  newFilters.selectedDateRange === DateRange.YearToDate ||
                  (newFilters.selectedYear !== null &&
                    newFilters.selectedYear !== undefined)),
            );
            setFilters(hasActiveFilter && newFilters ? newFilters : null);
            setIsSettingsOpen(false);
          }}
          isMpgaReport
          transactionYears={transactionYears ?? []}
        />
      )}
    </>
  );
};
