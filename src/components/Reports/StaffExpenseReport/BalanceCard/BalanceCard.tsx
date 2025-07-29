import React from 'react';
import { Visibility } from '@mui/icons-material';
import { Box, Card, CardActionArea, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';

interface BalanceCardProps {
  fundType: string;
  title: string;
  icon: React.ComponentType;
  iconBgColor?: string;
  startingBalance: number;
  endingBalance: number;
  transfersIn: number;
  transfersOut: number;
  onClick?: (fundType: string) => void;
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
    <Card
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 0,
        maxWidth: 'none',
        fontSize: '1.25rem',
        boxShadow: isSelected ? 3 : 1,
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <Box display={'flex'} flexDirection="row" alignItems="center" gap={1}>
        <Box
          sx={{
            backgroundColor: iconBgColor || 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={3} mb={2}>
        <Typography>
          {t('Starting Balance: ')}
          {startingBalance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        <Typography>
          {t('+ Transfers in: ')}

          {transfersIn.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        <Typography>
          {t('- Transfers out: ')}
          {Math.abs(transfersOut).toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        <Typography>
          {t('= Ending Balance: ')}
          {endingBalance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
      </Box>

      <ScreenOnly>
        <CardActionArea
          onClick={() => {
            onClick?.(fundType);
          }}
          sx={{
            p: 1,
            m: 0,
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSelected ? 'center' : 'flex-start',
          }}
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
        </CardActionArea>
      </ScreenOnly>
    </Card>
  );
};
