import { Box, CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from 'src/lib/intlFormat';

interface CircularProgressWithLabelProps {
  progress: number;
}

export const CircularProgressWithLabel: React.FC<
  CircularProgressWithLabelProps
> = ({ progress }) => {
  const locale = useLocale();
  return (
    <Box
      sx={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={28}
        thickness={4}
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
        >
          {percentageFormat(progress / 100, locale)}
        </Typography>
      </Box>
    </Box>
  );
};
