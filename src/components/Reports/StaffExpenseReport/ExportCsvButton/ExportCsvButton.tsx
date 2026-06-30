import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Menu, MenuItem, SvgIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { StyledPrintButton } from '../../styledComponents';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../Helpers/filterTransactions';
import { createCsvReport } from './downloadReport';

export interface ExportCsvButtonProps {
  transactions: Transaction[];
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const expenses = transactions.filter((transaction) => transaction.amount < 0);
  const incomes = transactions.filter((transaction) => transaction.amount > 0);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (type: ReportType, rows: Transaction[]) => {
    createCsvReport(type, rows, t, locale);
    handleClose();
  };

  return (
    <>
      <StyledPrintButton
        id="export-csv-button"
        aria-controls={open ? 'export-csv-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={
          <SvgIcon fontSize="small">
            <FileDownloadIcon />
          </SvgIcon>
        }
        endIcon={<ArrowDropDownIcon />}
        onClick={handleOpen}
        disabled={transactions.length === 0}
      >
        {t('Export CSV')}
      </StyledPrintButton>
      <Menu
        id="export-csv-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'export-csv-button' }}
      >
        <MenuItem
          disabled={incomes.length === 0}
          onClick={() => handleExport(ReportType.Income, incomes)}
        >
          {t('Income Report')}
        </MenuItem>
        <MenuItem
          disabled={expenses.length === 0}
          onClick={() => handleExport(ReportType.Expense, expenses)}
        >
          {t('Expense Report')}
        </MenuItem>
        <MenuItem
          disabled={incomes.length === 0 || expenses.length === 0}
          onClick={() => handleExport(ReportType.Combined, transactions)}
        >
          {t('Combined Report')}
        </MenuItem>
      </Menu>
    </>
  );
};
