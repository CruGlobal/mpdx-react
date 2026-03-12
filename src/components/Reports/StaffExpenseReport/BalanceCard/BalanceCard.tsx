import React from 'react';
import { Visibility } from '@mui/icons-material';
import { Box, Card, CardActionArea, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { StyledIconBox } from '../styledComponents/StyledIconBox';

const StyledCardActionArea = styled(CardActionArea, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  padding: theme.spacing(1),
  margin: 0,
  minHeight: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: isSelected ? 'center' : 'flex-start',
}));

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  minWidth: 0,
  maxWidth: 'none',
  fontSize: '1.25rem',
  boxShadow: isSelected ? theme.shadows[3] : theme.shadows[1],
  transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
  border: isSelected
    ? `1px dashed ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
}));

interface BalanceCardProps {
  fundType: string;
  title: string;
  icon: React.ComponentType;
  iconBgColor?: string;
  startBalance: number;
  endBalance: number;
  transfersIn: number;
  transfersOut: number;
  onClick: (fundType: string) => void;
  isSelected?: boolean;
}

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'start',
  gap: theme.spacing(1),
}));

const ScreenOnly = styled(Box)({
  '@media print': {
    display: 'none',
  },
});

export const BalanceCard: React.FC<BalanceCardProps> = ({
  fundType,
  title,
  icon: Icon,
  iconBgColor,
  startBalance,
  endBalance,
  transfersIn,
  transfersOut,
  onClick,
  isSelected = false,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <StyledCard variant="outlined" isSelected={isSelected}>
      <StyledHeaderBox>
        <StyledIconBox iconBgColor={iconBgColor}>
          <Icon />
        </StyledIconBox>
        <Typography variant="h6">{title}</Typography>
      </StyledHeaderBox>
      <Box display="flex" flexDirection="column" mt={3} mb={2}>
        <Typography>
          {t('Starting Balance: ')}
          {currencyFormat(startBalance, 'USD', locale)}
        </Typography>
        <Typography>
          {t('+ Transfers in: ')}
          {currencyFormat(transfersIn, 'USD', locale)}
        </Typography>
        <Typography>
          {t('- Transfers out: ')}
          {currencyFormat(Math.abs(transfersOut), 'USD', locale)}
        </Typography>
        <Typography>
          {t('= Ending Balance: ')}
          {currencyFormat(endBalance, 'USD', locale)}
        </Typography>
      </Box>

      <ScreenOnly>
        <StyledCardActionArea
          onClick={() => {
            onClick(fundType);
          }}
          isSelected={isSelected}
        >
          {isSelected ? (
            <Typography
              variant="h6"
              color="primary.main"
              fontWeight={600}
              textAlign="center"
            >
              {t('Currently Viewing')}
            </Typography>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Visibility fontSize="small" color="primary" />
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ textTransform: 'uppercase', fontWeight: 500 }}
              >
                {t('View Account')}
              </Typography>
            </Box>
          )}
        </StyledCardActionArea>
      </ScreenOnly>
    </StyledCard>
  );
};
