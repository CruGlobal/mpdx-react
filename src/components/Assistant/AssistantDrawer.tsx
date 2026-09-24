import React, { useEffect, useRef, useState } from 'react';
import { keyframes } from '@emotion/react';
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

const genieOpenMs = 220;
const genieCloseMs = 180;
const genieStart = 'scale(0.6, 0.63)';
const fadeOpenMs = 320;
const fadeCloseMs = 240;

const genieIn = keyframes({
  from: { opacity: 0, transform: genieStart },
  to: { opacity: 1, transform: 'none' },
});

const genieOut = keyframes({
  from: { opacity: 1, transform: 'none' },
  to: { opacity: 0, transform: genieStart },
});

const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });

// The card grows out of the orb below its bottom right corner, like the macOS Dock minimize
const Card = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  transformOrigin: 'bottom right',
  '&[data-genie="in"]': {
    animation: `${genieIn} ${genieOpenMs}ms ease-out both`,
  },
  '&[data-genie="out"]': {
    animation: `${genieOut} ${genieCloseMs}ms ease-in both`,
    pointerEvents: 'none',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&[data-genie="in"]': {
      animation: `${fadeIn} ${fadeOpenMs}ms ease-out both`,
    },
    '&[data-genie="out"]': {
      animation: `${fadeOut} ${fadeCloseMs}ms ease-in both`,
    },
  },
}));

// Keeps the card mounted while it plays its closing animation
const useClosingDelay = (open: boolean, ms: number): boolean => {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(timer);
  }, [open, ms]);

  return open || mounted;
};

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
  // Waits for the longer of the two closing animations so neither is cut short
  const cardMounted = useClosingDelay(
    open,
    Math.max(genieCloseMs, fadeCloseMs),
  );
  const wasMounted = useRef(cardMounted);
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
    if (wasMounted.current && !cardMounted && !fullScreen) {
      const active = document.activeElement;
      if (!active || active === document.body) {
        launcherRef.current?.focus();
      }
    }
    wasMounted.current = cardMounted;
  }, [cardMounted, fullScreen, launcherRef]);

  if (!visible) {
    return null;
  }

  const content = (
    <DrawerContent>
      <AssistantChat titleId={titleId} onClose={closeAssistant} />
    </DrawerContent>
  );

  if (!fullScreen) {
    return cardMounted ? (
      <Card
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal={false}
        data-genie={open ? 'in' : 'out'}
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
          maxHeight: 'min(80vh, calc(100vh - 120px))',
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
