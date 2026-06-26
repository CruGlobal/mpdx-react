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
    const rows = type === ReportTypeEnum.Income ? data.income : data.expenses;
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
            <FileDownloadIcon titleAccess={t('Export CSV')} />
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
        <MenuItem onClick={() => handleExport(ReportTypeEnum.Income)}>
          {t('Income')}
        </MenuItem>
        <MenuItem onClick={() => handleExport(ReportTypeEnum.Expenses)}>
          {t('Expenses')}
        </MenuItem>
      </Menu>
    </>
  );
};
