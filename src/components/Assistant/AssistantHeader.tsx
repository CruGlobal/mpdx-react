import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { GuideOrb } from './GuideOrb';

export type GuideStatus = 'ready' | 'connecting' | 'off' | 'failed';

const Header = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const StatusDot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: GuideStatus }>(({ theme, status }) => ({
  display: 'inline-block',
  flexShrink: 0,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: {
    ready: theme.palette.success.light,
    connecting: theme.palette.warning.light,
    off: theme.palette.grey[400],
    failed: theme.palette.error.light,
  }[status],
}));

const CloseButton = styled(IconButton)({
  alignSelf: 'flex-start',
  marginLeft: 'auto',
  color: 'inherit',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

interface AssistantHeaderProps {
  titleId: string;
  status: GuideStatus;
  busy?: boolean;
  onClose: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  titleId,
  status,
  busy = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const appName = getAppName();
  const statusText = {
    ready: t('Here to show you around'),
    connecting: t('Connecting'),
    off: t('Off right now'),
    failed: t('Could not connect'),
  }[status];

  return (
    <Header>
      <GuideOrb
        size={48}
        data-animating
        data-busy={busy}
        data-testid="GuideHeaderOrb"
        aria-hidden
      />
      <Box minWidth={0}>
        <Typography id={titleId} variant="h6" component="h2" lineHeight={1.3}>
          {t('{{appName}} Guide', { appName })}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <StatusDot status={status} aria-hidden />
          <Typography variant="body2">{statusText}</Typography>
        </Box>
      </Box>
      <CloseButton
        size="small"
        aria-label={t('Close {{appName}} Guide', { appName })}
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </CloseButton>
    </Header>
  );
};
