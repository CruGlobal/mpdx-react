import React from 'react';
import { Box, Grid, Skeleton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Maybe } from 'src/graphql/types.generated';

const WidgetStatGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1.5),
}));

interface WidgetStatProps {
  loading: boolean;
  stat?: Maybe<number>;
  statName: string;
  toolTip: string;
}

export const WidgetStat: React.FC<WidgetStatProps> = ({
  loading,
  stat,
  statName,
  toolTip,
}) => (
  <WidgetStatGrid xs={6} item gap={0.5}>
    {loading ? (
      <Skeleton width={'100%'} height={'30px'} />
    ) : (
      <Tooltip title={toolTip} arrow>
        <Box>
          <Typography variant="h6">{stat}</Typography>
          <Typography component="div" color="textSecondary">
            {statName}
          </Typography>
        </Box>
      </Tooltip>
    )}
  </WidgetStatGrid>
);
