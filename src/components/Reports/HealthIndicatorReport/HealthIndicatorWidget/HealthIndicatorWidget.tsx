import NextLink from 'next/link';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import StyledProgress from 'src/components/StyledProgress';
import { useHealthIndicatorWidgetQuery } from './HealthIndicatorWidget.generated';
import { WidgetStat } from './WidgetStat/WidgetStat';

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

interface HealthIndicatorWidgetProps {
  accountListId: string;
  showHealthIndicator: boolean;
  setShowHealthIndicator: Dispatch<SetStateAction<boolean>>;
}

export const HealthIndicatorWidget: React.FC<HealthIndicatorWidgetProps> = ({
  accountListId,
  showHealthIndicator,
  setShowHealthIndicator,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useHealthIndicatorWidgetQuery({
    variables: {
      accountListId,
      month: DateTime.now().startOf('month').toISODate(),
    },
  });

  useEffect(() => {
    setShowHealthIndicator(!!data?.healthIndicatorData.length);
  }, [data]);

  if (!showHealthIndicator) {
    return null;
  }

  const currentStats = data?.healthIndicatorData[0];

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
            toolTip={t('% of Self-raised Funds over Total Funds')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.consistencyHi}
            statName={t('Consistency')}
            toolTip={t('% of months with positive account balance')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.successHi}
            statName={t('Success')}
            toolTip={t('% of Self-raised Funds over Support Goal')}
          />
          <WidgetStat
            loading={loading}
            stat={currentStats?.depthHi}
            statName={t('Depth')}
            toolTip={t('Trend of local partners')}
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
