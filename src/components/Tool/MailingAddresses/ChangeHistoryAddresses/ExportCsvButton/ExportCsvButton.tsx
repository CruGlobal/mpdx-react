import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StyledPrintButton } from 'src/components/Reports/styledComponents';

interface ExportCsvButtonProps {
  disabled?: boolean;
  exporting?: boolean;
  onClick: () => void;
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  disabled,
  exporting = false,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <StyledPrintButton
      disabled={disabled || exporting}
      onClick={onClick}
      startIcon={
        exporting ? <CircularProgress size={20} /> : <FileDownloadIcon />
      }
      sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {exporting ? t('Exporting...') : t('Export CSV')}
    </StyledPrintButton>
  );
};
