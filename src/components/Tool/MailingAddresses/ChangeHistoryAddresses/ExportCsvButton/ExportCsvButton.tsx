import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTranslation } from 'react-i18next';
import { StyledPrintButton } from 'src/components/Reports/styledComponents';

interface ExportCsvButtonProps {
  disabled?: boolean;
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <StyledPrintButton
      disabled={disabled}
      startIcon={<FileDownloadIcon />}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {t('Export CSV')}
    </StyledPrintButton>
  );
};
