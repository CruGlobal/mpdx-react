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
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import StyledProgress from 'src/components/StyledProgress';
import { Maybe } from 'src/graphql/types.generated';
import { useHealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: 0,
  height: 'calc(100% - 103px)',
}));

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  gap: 2,
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const WidgetStatGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1.5),
}));

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
    <AnimatedCard sx={{ height: '100%' }}>
      <CardHeader
        title={t('MPD Health Indicator')}
        titleTypographyProps={{
          style: { fontSize: '1rem' },
        }}
      />
      <StyledCardContent>
        <StyledBox>
          <Typography variant="h4" color="primary" width={'55px'}>
            {currentStats?.overallHi}
          </Typography>
          <Box width={'calc(100% - 55px)'}>
            <Typography
              component="div"
              color="primary"
              sx={{ marginBottom: 1 }}
            >
              {t('Overall Health Indicator')}
            </Typography>
            <StyledProgress
              loading={loading}
              primary={
                currentStats?.overallHi ? currentStats.overallHi / 100 : 0
              }
              barHeight={20}
            />
          </Box>
        </StyledBox>

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
      </StyledCardContent>
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
  <WidgetStatGrid xs={6} item gap={0.5}>
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
  </WidgetStatGrid>
);
