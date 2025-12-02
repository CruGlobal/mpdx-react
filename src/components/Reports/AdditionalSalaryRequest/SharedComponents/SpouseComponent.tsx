import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <ImportExportIcon
          fontSize="small"
          color="action"
          sx={{ transform: 'rotate(90deg)' }}
        />
        <Link href="#" variant="body1" underline="hover" onClick={() => {}}>
          {t('Request additional salary from jane')}
        </Link>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t('Up to her remaining allowable salary of $12,200')}
      </Typography>
    </Box>
  );
};
