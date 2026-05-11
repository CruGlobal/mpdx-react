import { Box, CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from 'src/lib/intlFormat';

interface CircularProgressWithLabelProps {
  progress: number;
  loading?: boolean;
}

export const CircularProgressWithLabel: React.FC<
  CircularProgressWithLabelProps
> = ({ progress, loading = false }) => {
  const locale = useLocale();
  const { t } = useTranslation();
  const formattedProgress = percentageFormat(progress / 100, locale);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {loading ? (
        <CircularProgress
          variant="indeterminate"
          size={28}
          thickness={4}
          aria-label={t('Calculating progress')}
        />
      ) : (
        <>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={28}
            thickness={4}
            aria-label={t('Section progress')}
          />
          <Box
            sx={{
              position: 'absolute',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{ color: 'text.secondary', fontSize: 10 }}
              aria-hidden
            >
              {formattedProgress}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};
