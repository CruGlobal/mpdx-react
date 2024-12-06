import { Grid, Skeleton } from '@mui/material';

interface BarChartSkeletonProps {
  bars: number;
}

export const BarChartSkeleton: React.FC<BarChartSkeletonProps> = ({ bars }) => (
  <Grid
    container
    justifyContent="space-between"
    alignItems="flex-end"
    height="100%"
    data-testid="BarChartSkeleton"
  >
    {new Array(bars).fill(undefined).map((_, index) => (
      <Skeleton
        key={index}
        variant="rectangular"
        width={30}
        height={((100 / bars) * (index + 1)).toFixed() + '%'}
        data-testid="SkeletonBar"
      />
    ))}
  </Grid>
);
