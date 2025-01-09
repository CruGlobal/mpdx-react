import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { Box, Card, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useHealthIndicatorFormulaQuery } from './HealthIndicatorFormula.generated';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 2,
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

interface HealthIndicatorFormulaProps {
  accountListId: string;
  noHealthIndicatorData: boolean;
}

export const HealthIndicatorFormula: React.FC<HealthIndicatorFormulaProps> = ({
  accountListId,
  noHealthIndicatorData,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useHealthIndicatorFormulaQuery({
    variables: {
      accountListId,
    },
  });


  const latestMpdHealthData = data?.healthIndicatorData.at(-1);

  if (noHealthIndicatorData) {
    return null;
  }

  return (
    <Card sx={{ padding: 3, mb: 5 }}>
      <Typography variant="h6" mb={2}>
        {t('MPD Health')} = [({t('Ownership')} x 3) + ({t('Success')} x 2) + (
        {t('Consistency')} x 1) + ({t('Depth')} x 1)] / 7
      </Typography>
      <Box pl={2}>
        <FormulaItem
          name={t('Ownership')}
          explanation={t('% of Self-raised funds over total funds')}
          value={latestMpdHealthData?.ownershipHi ?? 0}
          isLoading={loading}
        />
        <FormulaItem
          name={t('Success')}
          explanation={t('% of Self-raised funds over support goal')}
          value={latestMpdHealthData?.successHi ?? 0}
          isLoading={loading}
        />
        <FormulaItem
          name={t('Consistency')}
          explanation={t('% of months with positive account balance')}
          value={latestMpdHealthData?.consistencyHi ?? 0}
          isLoading={loading}
        />
        <FormulaItem
          name={t('Depth')}
          explanation={t('Trend of local partners')}
          value={latestMpdHealthData?.depthHi ?? 0}
          isLoading={loading}
        />
      </Box>
    </Card>
  );
};

interface FormulaItemProps {
  name: string;
  explanation: string;
  value: number;
  isLoading: boolean;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  name,
  explanation,
  value,
  isLoading,
}) => (
  <StyledBox>
    {isLoading ? (
      <Skeleton width={'60px'} height={'42px'} />
    ) : (
      <Typography variant="h4" color="primary" fontWeight="bold" width={'60px'}>
        {value}
      </Typography>
    )}
    <Box width={'calc(100% - 60px)'} display="flex" gap={0.7}>
      <Typography fontWeight="bold">{name} = </Typography>
      <Typography>{explanation}</Typography>
    </Box>
  </StyledBox>
);
