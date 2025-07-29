import React from 'react';
import { MoveToInbox, Outbox } from '@mui/icons-material';
import { Box, Button, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';

interface BalanceCardProps {
  title: string;
  icon: React.ComponentType;
  iconBgColor?: string;
  balance: number;
  pending: number;
  onClick?: (fundType: string) => void;
  isSelected?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  icon: Icon,
  iconBgColor,
  balance,
  pending,
  //onClick,
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
        <Box>
          <Typography variant="body1" mb={0} sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="body2" mt={0}>
            {t('Updated 3 min ago')}
          </Typography>
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        mb={1}
        mr={1}
      >
        <Typography variant="h5">
          {balance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        <Typography variant="h5" color="#00000061">
          {pending.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}{' '}
          (pending)
        </Typography>
      </Box>

      <Box
        sx={{
          alignItems: 'left',
          mt: 3,
          ml: 0,
        }}
      >
        <Button>
          <Outbox fontSize="small" />
          {t('Transfer From').toUpperCase()}
        </Button>
        <Button>
          <MoveToInbox fontSize="small" />
          {t('Transfer To').toUpperCase()}
        </Button>
      </Box>
    </Card>
  );
};
