import React from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Fund } from 'src/graphql/types.generated';

type BalanceCardProps = {
  fundType: Fund['fundType'];
  title: string;
  icon: React.ComponentType;
  iconBgColor?: string;
  startingBalance: number;
  endingBalance: number;
  transfersIn: number;
  transfersOut: number;
  onClick?: (fundType: Fund['fundType']) => void;
  isSelected?: boolean;
};

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
          {startingBalance !== undefined
            ? startingBalance.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
        <Typography>
          {t('+ Transfers in: ')}
          {transfersIn !== undefined
            ? transfersIn.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
        <Typography>
          {t('- Transfers out: ')}
          {transfersOut !== undefined
            ? Math.abs(transfersOut).toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
        <Typography>
          {t('= Ending Balance: ')}
          {endingBalance !== undefined
            ? endingBalance.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })
            : ''}
        </Typography>
      </Box>

      <CardActionArea
        onClick={() => {
          onClick?.(fundType);
        }}
        sx={{ p: 1, m: 0 }}
      >
        <Typography
          variant="body2"
          color="textSecondary"
          display="flex"
          alignItems="center"
          gap={1}
        >
          {/* {isSelected ? <Visibility fontSize="small" /> : null} */}
          <Typography variant="body1" color={'primary.main'}>
            {isSelected ? t('Currently Viewing') : t('View Account')}
          </Typography>
        </Typography>
      </CardActionArea>
    </Card>
  );
};
