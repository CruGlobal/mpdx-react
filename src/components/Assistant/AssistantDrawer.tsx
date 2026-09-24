import React, { useEffect, useRef } from 'react';
import { Box, Drawer, Paper, useMediaQuery } from '@mui/material';
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

const Card = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
}));

// Like a chat widget, the desktop card leaves the page usable, while phones get a full-screen modal
export const AssistantDrawer: React.FC = () => {
  const visible = useAssistantVisibility();
  const { open, closeAssistant, launcherRef } = useAssistantContext();
  const theme = useTheme();
  // The drawer only loads after the first open, so it never renders on the server
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const viewport = useVisualViewport(open && fullScreen);
  const wasOpen = useRef(open);
  const cardRef = useRef<HTMLDivElement>(null);

  // The Helpjuice beacon sits in the corner the drawer covers, so it would overlap the chat
  useHelpjuiceBeaconStyle(open, 'display', 'none');

  // Without the modal focus trap, the card itself takes focus when nothing inside it autofocused
  useEffect(() => {
    const card = cardRef.current;
    if (open && card && !card.contains(document.activeElement)) {
      card.focus();
    }
  }, [open, fullScreen]);

  // Focus inside the card is lost when it unmounts, so it goes back to the launcher that opened it
  useEffect(() => {
    if (wasOpen.current && !open && !fullScreen) {
      const active = document.activeElement;
      if (!active || active === document.body) {
        launcherRef.current?.focus();
      }
    }
    wasOpen.current = open;
  }, [open, fullScreen, launcherRef]);

  if (!visible) {
    return null;
  }

  const content = (
    <DrawerContent>
      <AssistantChat titleId={titleId} onClose={closeAssistant} />
    </DrawerContent>
  );

  if (!fullScreen) {
    return open ? (
      <Card
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal={false}
        aria-labelledby={titleId}
        elevation={8}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closeAssistant();
          }
        }}
        style={{
          width: 400,
          height: 640,
          maxHeight: '80vh',
          right: orbInset,
          bottom: orbInset + orbSize + cardGap,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {content}
      </Card>
    ) : null;
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
          style: {
            width: '100vw',
            height: viewport ? `${viewport.height}px` : '100dvh',
            top: viewport?.offsetTop ?? 0,
          },
        },
        transition: { onExited: () => launcherRef.current?.focus() },
      }}
    >
      {content}
    </Drawer>
  );
};
