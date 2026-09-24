import React, { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { AssistantChat } from './AssistantChat';
import { useAssistantContext } from './AssistantProvider';
import { useAssistantVisibility } from './useAssistantVisibility';
import { useVisualViewport } from './useVisualViewport';

const titleId = 'assistant-drawer-title';

const DrawerContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1, 1, 2),
}));

export const AssistantDrawer: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const visible = useAssistantVisibility();
  const { open, closeAssistant, launcherRef } = useAssistantContext();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const viewport = useVisualViewport(open && fullScreen);

  // The Helpjuice beacon sits in the corner the drawer covers, so it would overlap the chat
  useEffect(() => {
    const beacon = document.getElementById('helpjuice-widget');
    if (!open || !beacon) {
      return;
    }
    const display = beacon.style.getPropertyValue('display');
    const priority = beacon.style.getPropertyPriority('display');
    beacon.style.setProperty('display', 'none', 'important');
    return () => beacon.style.setProperty('display', display, priority);
  }, [open]);

  if (!visible) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeAssistant}
      // The first-run dialog opens the drawer, so MUI would restore focus to that dialog's removed button
      ModalProps={{ disableRestoreFocus: true }}
      slotProps={{
        paper: {
          'aria-labelledby': titleId,
          style: fullScreen
            ? {
                width: '100vw',
                height: viewport ? `${viewport.height}px` : '100dvh',
                top: viewport?.offsetTop ?? 0,
              }
            : { width: 400 },
        },
        transition: { onExited: () => launcherRef.current?.focus() },
      }}
    >
      <DrawerContent>
        <Header>
          <Typography id={titleId} variant="h6" component="h2">
            {t('{{appName}} Guide', { appName })}
          </Typography>
          <IconButton
            aria-label={t('Close {{appName}} Guide', { appName })}
            onClick={closeAssistant}
          >
            <CloseIcon />
          </IconButton>
        </Header>
        <Divider />
        <AssistantChat />
      </DrawerContent>
    </Drawer>
  );
};
