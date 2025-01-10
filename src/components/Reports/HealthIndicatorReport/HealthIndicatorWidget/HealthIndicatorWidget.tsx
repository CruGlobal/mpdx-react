import NextLink from 'next/link';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
  goal: number;
  onDashboard: boolean;
  showHealthIndicator: boolean;
  setShowHealthIndicator: Dispatch<SetStateAction<boolean>>;
  setMachineCalculatedGoal: Dispatch<SetStateAction<number | null>>;
}

export const HealthIndicatorWidget: React.FC<HealthIndicatorWidgetProps> = ({
  accountListId,
  goal,
  onDashboard = true,
  showHealthIndicator,
  setShowHealthIndicator,
  setMachineCalculatedGoal,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useHealthIndicatorWidgetQuery({
    variables: {
      accountListId,
    },
  });

  useEffect(() => {
    setShowHealthIndicator(!!data?.healthIndicatorData.length);
    const { machineCalculatedGoal } = data?.healthIndicatorData.at(-1) ?? {};
    setMachineCalculatedGoal(
      machineCalculatedGoal && !goal ? machineCalculatedGoal : null,
    );
  }, [data, goal]);

  if (!showHealthIndicator) {
    return null;
  }

  const currentStats = data?.healthIndicatorData.at(-1);

  return (
    <AnimatedCard sx={{ height: '100%' }}>
      <CardHeader
        title={t('MPD Health Indicator')}
        titleTypographyProps={{
          style: { fontSize: '1rem' },
        }}
      />
      <StyledCardContent>
        <Tooltip
          title={`${t('MPD Health')} = [(${t('Ownership')} x 3) + (${t(
            'Success',
          )} x 2) + (
            ${t('Consistency')} x 1) + (${t('Depth')} x 1)] / 7`}
          arrow
        >
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
        </Tooltip>

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
      {onDashboard && (
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
      )}
    </AnimatedCard>
  );
};
