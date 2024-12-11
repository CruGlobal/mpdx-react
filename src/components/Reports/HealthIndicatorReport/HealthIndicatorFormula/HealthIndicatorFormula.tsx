import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 2,
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

interface HealthIndicatorFormulaProps {}

export const HealthIndicatorFormula: React.FC<
  HealthIndicatorFormulaProps
> = () => {
  const { t } = useTranslation();

  return (
    <Card sx={{ padding: 3 }}>
      <Typography variant="h6" mb={2}>
        {t('MPD Health')} = [({t('Ownership')} * 3) + ({t('Success')} * 2) + (
        {t('Consistency')} * 1) + ({t('Depth')} * 1)] / 7
      </Typography>
      <Box pl={2}>
        <FormulaItem
          name={t('Ownership')}
          explanation={t('% of Self-raised Funds over Total Funds')}
          value={90}
        />
        <FormulaItem
          name={t('Success')}
          explanation={t('% of Self-raised Funds over Support Goal')}
          value={90}
        />
        <FormulaItem
          name={t('Consistency')}
          explanation={t('% of months with positive account balance')}
          value={90}
        />
        <FormulaItem
          name={t('Depth')}
          explanation={t('Trend of local partners')}
          value={90}
        />
      </Box>
    </Card>
  );
};

interface FormulaItemProps {
  name: string;
  explanation: string;
  value: number;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  name,
  explanation,
  value,
}) => (
  <StyledBox>
    <Typography variant="h4" color="primary" fontWeight="bold" width={'55px'}>
      {value}
    </Typography>
    <Box width={'calc(100% - 55px)'} display="flex" gap={0.7}>
      <Typography fontWeight="bold">{name} = </Typography>
      <Typography>{explanation}</Typography>
    </Box>
  </StyledBox>
);
