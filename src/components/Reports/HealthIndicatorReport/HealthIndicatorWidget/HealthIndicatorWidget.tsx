import NextLink from 'next/link';
import React from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import StyledProgress from 'src/components/StyledProgress';
import { Maybe } from 'src/graphql/types.generated';
import { useHealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';

interface HealthIndicatorWidgetProps {
  accountListId: string;
}

export const HealthIndicatorWidget: React.FC<HealthIndicatorWidgetProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useHealthIndicatorWidgetQuery({
    variables: {
      accountListId,
    },
  });

  const currentStats =
    data?.healthIndicatorData[data?.healthIndicatorData.length - 1];

  return (
    <AnimatedCard>
      <CardHeader
        title={t('MPD Health Indicator')}
        titleTypographyProps={{
          style: { fontSize: '1rem' },
        }}
      />
      <CardContent>
        <Box
          display={'flex'}
          gap={2}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography variant="h4" color={'primary'} width={'55px'}>
            {currentStats?.overallHi}
          </Typography>
          <Box width={'calc(100% - 55px)'}>
            <Typography component="div" color="primary">
              {t('Overall Health Indicator')}
            </Typography>
            <StyledProgress
              loading={loading}
              primary={
                currentStats?.overallHi ? currentStats.overallHi / 100 : 0
              }
            />
          </Box>
        </Box>

        <Grid container>
          <WidgetStat
            loading={loading}
            stat={currentStats?.ownershipHi}
            statName={t('Ownership')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.consistencyHi}
            statName={t('Consistency')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.successHi}
            statName={t('Success')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.depthHi}
            statName={t('Depth')}
          />
        </Grid>
      </CardContent>
      <CardActions>
        <Button
          LinkComponent={NextLink}
          href={`/accountLists/${accountListId}/reports/healthIndicator`}
          size="small"
          color="primary"
        >
          {t('View Details')}
        </Button>
      </CardActions>
    </AnimatedCard>
  );
};

interface WidgetStatProps {
  loading: boolean;
  stat?: Maybe<number>;
  statName: string;
}

const WidgetStat: React.FC<WidgetStatProps> = ({ loading, stat, statName }) => (
  <Grid xs={6} item display={'flex'} alignItems={'center'} gap={0.5}>
    {loading ? (
      <Skeleton width={'100%'} height={'30px'} />
    ) : (
      <>
        <Typography variant="h6">{stat}</Typography>
        <Typography component="div" color="textSecondary">
          {statName}
        </Typography>
      </>
    )}
  </Grid>
);
