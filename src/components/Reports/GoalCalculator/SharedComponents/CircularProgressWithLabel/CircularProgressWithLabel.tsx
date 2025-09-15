import { Box, CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';

interface CircularProgressWithLabelProps {
  progress: number;
}

export const CircularProgressWithLabel: React.FC<
  CircularProgressWithLabelProps
> = ({ progress }) => {
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
        >{`${Math.round(progress)}%`}</Typography>
      </Box>
    </Box>
  );
};
