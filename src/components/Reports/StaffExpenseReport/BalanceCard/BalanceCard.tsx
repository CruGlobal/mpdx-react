import React from 'react';
import { Visibility } from '@mui/icons-material';
import { Box, Card, CardActionArea, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

const StyledCardActionArea = styled(CardActionArea)<{ isSelected: boolean }>(
  ({ theme, isSelected }) => ({
    padding: theme.spacing(1),
    margin: 0,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: isSelected ? 'center' : 'flex-start',
  }),
);

const StyledIconBox = styled(Box)<{ iconBgColor?: string }>(
  ({ theme, iconBgColor }) => ({
    backgroundColor: iconBgColor || theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
);

const StyledCard = styled(Card)<{ isSelected: boolean }>(
  ({ theme, isSelected }) => ({
    padding: theme.spacing(2),
    flex: 1,
    minWidth: 0,
    maxWidth: 'none',
    fontSize: '1.25rem',
    boxShadow: isSelected ? theme.shadows[3] : theme.shadows[1],
    transition: 'box-shadow 0.3s ease-in-out',
  }),
);

interface BalanceCardProps {
  fundType: string;
  title: string;
  icon: React.ComponentType;
  iconBgColor?: string;
  startingBalance: number;
  endingBalance: number;
  transfersIn: number;
  transfersOut: number;
  onClick: (fundType: string) => void;
  isSelected?: boolean;
}

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
  startingBalance,
  endingBalance,
  transfersIn,
  transfersOut,
  onClick,
  isSelected = false,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <StyledCard variant="outlined" isSelected={isSelected}>
      <Box display={'flex'} flexDirection="row" alignItems="center" gap={1}>
        <StyledIconBox iconBgColor={iconBgColor}>
          <Icon />
        </StyledIconBox>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={3} mb={2}>
        <Typography>
          {t('Starting Balance: ')}
          {currencyFormat(startingBalance, 'USD', locale)}
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
          {currencyFormat(endingBalance, 'USD', locale)}
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
