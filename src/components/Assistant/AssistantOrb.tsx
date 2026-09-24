import React, { useId, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonBase, IconButton, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { useAssistantContext } from './AssistantProvider';
import { GuideOrb, launcherOrbShadow, orbInset, orbSize } from './GuideOrb';
import { useHelpjuiceBeaconStyle } from './helpjuiceBeacon';
import { useAssistantLaunch } from './useAssistantLaunch';
import { useGuideNudge } from './useGuideNudge';

const beaconGap = 16;

const Corner = styled('div')(({ theme }) => ({
  position: 'fixed',
  right: orbInset,
  bottom: orbInset,
  zIndex: theme.zIndex.speedDial,
  '@media print': {
    display: 'none',
  },
}));

// The pill and the orb are one button, so the label adds no extra tab stop
const Launcher = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  borderRadius: orbSize / 2,
  '&.Mui-focusVisible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: 3,
  },
  '&:hover .GuideOrb-pill': {
    boxShadow: theme.shadows[3],
  },
  '&:hover .GuideOrb-circle': {
    filter: 'brightness(1.1)',
  },
}));

const Pill = styled('span', {
  shouldForwardProp: (prop) => prop !== 'nudge',
})<{ nudge: boolean }>(({ theme, nudge }) => ({
  ...theme.typography.body2,
  position: 'relative',
  padding: nudge ? theme.spacing(1.25, 2, 1.25, 4) : theme.spacing(0.75, 1.5),
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: nudge ? theme.shadows[3] : theme.shadows[1],
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('box-shadow'),
  // A small tail that points at the orb
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -5,
    top: '50%',
    width: 10,
    height: 10,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
  },
}));

const DismissButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(0.5),
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
}));

export const AssistantOrb: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const { launcher, launch, firstRunDialog } = useAssistantLaunch();
  const { open } = useAssistantContext();
  const orbRef = useRef<HTMLButtonElement>(null);
  const nudgeId = useId();
  const visible = launcher !== 'hidden';
  const nudge = useGuideNudge(visible && !phone);

  // The beacon shares the bottom right corner, so it moves over by the orb's width
  useHelpjuiceBeaconStyle(visible, 'margin-right', `${orbSize + beaconGap}px`);

  if (!visible) {
    return null;
  }

  const openGuide = () => {
    nudge.dismiss();
    launch(orbRef.current);
  };

  return (
    <Corner>
      {!open && nudge.show && (
        <DismissButton
          size="small"
          aria-label={t('Dismiss')}
          onClick={nudge.dismiss}
        >
          <CloseIcon fontSize="small" />
        </DismissButton>
      )}
      <Launcher
        ref={orbRef}
        aria-label={t('Open {{appName}} Guide', { appName })}
        aria-describedby={!open && nudge.show ? nudgeId : undefined}
        onClick={openGuide}
      >
        {!open && (
          <Pill className="GuideOrb-pill" nudge={nudge.show}>
            {nudge.show ? (
              <span id={nudgeId}>
                {t('Need a hand with {{appName}}?', { appName })}
              </span>
            ) : (
              t('{{appName}} Guide', { appName })
            )}
          </Pill>
        )}
        <GuideOrb
          className="GuideOrb-circle"
          size={orbSize}
          data-guide-orb
          data-animating={open || undefined}
          sx={{ boxShadow: launcherOrbShadow }}
        />
      </Launcher>
      {firstRunDialog}
    </Corner>
  );
};
