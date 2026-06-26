import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Menu, MenuItem, SvgIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { StyledPrintButton } from '../../styledComponents';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { AllData } from '../mockData';

interface ExportCsvButtonProps {
  data: AllData;
  months: string[];
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  data,
  months,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (type: ReportTypeEnum) => {
    let rows: AllData['income'];
    switch (type) {
      case ReportTypeEnum.Income:
        rows = data.income;
        break;
      case ReportTypeEnum.Expenses:
        rows = data.expenses;
        break;
      default:
        // Exhaustiveness check: adding a ReportTypeEnum member without
        // handling it here becomes a compile-time error.
        return ((_exhaustive: never) => _exhaustive)(type);
    }
    exportToCsv(rows, type, months, locale);
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
          disabled={!data.income.length}
          onClick={() => handleExport(ReportTypeEnum.Income)}
        >
          {t('Income')}
        </MenuItem>
        <MenuItem
          disabled={!data.expenses.length}
          onClick={() => handleExport(ReportTypeEnum.Expenses)}
        >
          {t('Expenses')}
        </MenuItem>
      </Menu>
    </>
  );
};
