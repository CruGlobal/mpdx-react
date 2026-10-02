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

interface NameDisplaySkeletonProps {
  showContent?: boolean;
}

export const NameDisplaySkeleton: React.FC<NameDisplaySkeletonProps> = ({
  showContent,
}) => {
  const theme = useTheme();

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
              {[0, 1].map((column) => (
                <Grid size={6} key={column}>
                  <Typography variant="body1">
                    <Skeleton width={180} />
                  </Typography>
                  <Typography variant="h3">
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
