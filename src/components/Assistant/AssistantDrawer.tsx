import React from 'react';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { AssistantChat } from './AssistantChat';
import { useAssistantContext } from './AssistantProvider';
import { orbInset, orbSize } from './GuideOrb';
import { useHelpjuiceBeaconStyle } from './helpjuiceBeacon';
import { useAssistantVisibility } from './useAssistantVisibility';
import { useVisualViewport } from './useVisualViewport';

const titleId = 'assistant-drawer-title';
const cardGap = 16;

const DrawerContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const AssistantDrawer: React.FC = () => {
  const visible = useAssistantVisibility();
  const { open, closeAssistant, launcherRef } = useAssistantContext();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const viewport = useVisualViewport(open && fullScreen);

  // The Helpjuice beacon sits in the corner the drawer covers, so it would overlap the chat
  useHelpjuiceBeaconStyle(open, 'display', 'none');

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
            : {
                width: 400,
                height: 640,
                maxHeight: '80vh',
                top: 'auto',
                right: orbInset,
                bottom: orbInset + orbSize + cardGap,
                borderRadius: 16,
                overflow: 'hidden',
              },
        },
        // The card floats over the page, so dimming everything behind it would feel heavy
        backdrop: { invisible: !fullScreen },
        transition: { onExited: () => launcherRef.current?.focus() },
      }}
    >
      <DrawerContent>
        <AssistantChat titleId={titleId} onClose={closeAssistant} />
      </DrawerContent>
    </Drawer>
  );
};
