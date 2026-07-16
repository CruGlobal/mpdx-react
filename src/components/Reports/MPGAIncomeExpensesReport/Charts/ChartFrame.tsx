import { Box } from '@mui/material';
import { ResponsiveContainer } from 'recharts';
import { LoadingBox, LoadingIndicator } from '../../styledComponents';

interface ChartFrameProps {
  width: number;
  aspect: number;
  children: React.ReactElement;
  loading?: boolean;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  width,
  aspect,
  children,
  loading,
}) => (
  <Box
    sx={{
      width: `${width}%`,
      aspectRatio: `${aspect}`,
      '@media print': { aspectRatio: 'auto' },
    }}
  >
    {loading ? (
      <LoadingBox sx={{ width: '100%', height: '100%', minWidth: 0 }}>
        <LoadingIndicator
          data-testid="loading-spinner"
          color="primary"
          size={50}
        />
      </LoadingBox>
    ) : (
      <ResponsiveContainer width="100%" aspect={aspect}>
        {children}
      </ResponsiveContainer>
    )}
  </Box>
);
