import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { columnLayout } from './NameDisplay';

interface NameDisplaySkeletonProps {
  showContent?: boolean;
  columns?: 2 | 3;
}

export const NameDisplaySkeleton: React.FC<NameDisplaySkeletonProps> = ({
  showContent,
  columns = 2,
}) => {
  const theme = useTheme();
  const { size, amountVariant } = columnLayout(columns);

  return (
    <Box data-testid="name-display-skeleton">
      <Card sx={{ marginBottom: theme.spacing(2), boxShadow: 1 }}>
        <CardHeader
          title={
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">
                <Skeleton width={200} />
              </Typography>
              <Skeleton width={160} />
            </Box>
          }
          sx={{ paddingInline: theme.spacing(4) }}
        />
        {showContent && (
          <CardContent data-testid="name-display-skeleton-amounts">
            <Grid container spacing={theme.spacing(2)}>
              {Array.from({ length: columns }, (_, column) => (
                <Grid
                  size={size}
                  key={column}
                  data-testid="name-display-skeleton-column"
                >
                  <Typography variant="body1">
                    <Skeleton width={180} />
                  </Typography>
                  <Typography variant={amountVariant}>
                    <Skeleton width={160} />
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};
