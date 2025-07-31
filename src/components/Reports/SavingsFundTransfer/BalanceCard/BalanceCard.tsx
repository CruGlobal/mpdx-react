import React from 'react';
import { MoveToInbox, Outbox } from '@mui/icons-material';
import { Box, Button, Card, SvgIconProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import {
  HandleOpenTransferModalProps,
  ScreenOnly,
} from '../TransfersPage/TransfersPage';

interface BalanceCardProps {
  title: string;
  icon: React.ComponentType<SvgIconProps>;
  iconBgColor?: string;
  balance: number;
  pending: number;
  handleOpenTransferModal: ({
    accountTransferFromId,
    accountTransferToId,
  }: HandleOpenTransferModalProps) => void;
  isSelected?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  icon: Icon,
  iconBgColor,
  balance,
  pending,
  handleOpenTransferModal,
  isSelected = false,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const handleTransferFrom = () => {
    handleOpenTransferModal({
      accountTransferFromId: 'fromAccountId',
    });
  };

  const handleTransferTo = () => {
    handleOpenTransferModal({
      accountTransferToId: 'toAccountId',
    });
  };

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
            '@media print': {
              color: iconBgColor,
            },
          }}
        >
          <Icon
            sx={{
              color: 'inherit',
            }}
          />
        </Box>
        <Box>
          <Typography
            variant="body1"
            mb={0}
            sx={{ '@media print': { fontSize: '10pt' }, fontWeight: 500 }}
          >
            {title}
          </Typography>
          <ScreenOnly>
            <Typography variant="body2" mt={0}>
              {t('Updated 3 min ago')}
            </Typography>
          </ScreenOnly>
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        mb={1}
        mr={1}
        sx={{
          '@media print': {
            fontSize: '14pt',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mt: 2,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontSize: 'inherit' }}>
          {balance.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
        <Typography variant="h5" color="#00000061" sx={{ fontSize: 'inherit' }}>
          {pending.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}{' '}
          (pending)
        </Typography>
      </Box>

      <ScreenOnly
        sx={{
          alignItems: 'left',
          mt: 3,
          ml: 0,
        }}
      >
        <Button onClick={handleTransferFrom}>
          <Outbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('Transfer From').toUpperCase()}
        </Button>
        <Button onClick={handleTransferTo}>
          <MoveToInbox fontSize="small" sx={{ mr: 0.5 }} />
          {t('Transfer To').toUpperCase()}
        </Button>
      </ScreenOnly>
    </Card>
  );
};
