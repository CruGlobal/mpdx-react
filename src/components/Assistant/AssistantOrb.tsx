import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonBase, IconButton, Paper, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { useAssistantContext } from './AssistantProvider';
import { orbButtonStyles, orbInset, orbSize } from './GuideOrb';
import { useHelpjuiceBeaconStyle } from './helpjuiceBeacon';
import { useAssistantLaunch } from './useAssistantLaunch';
import { useGuideNudge } from './useGuideNudge';

const beaconGap = 16;
const nudgeGap = 12;

const OrbButton = styled(ButtonBase)(({ theme }) => ({
  ...orbButtonStyles,
  position: 'fixed',
  right: orbInset,
  bottom: orbInset,
  zIndex: theme.zIndex.speedDial,
  '&.Mui-focusVisible': {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: 3,
  },
  '@media print': {
    display: 'none',
  },
}));

const Nudge = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  right: orbInset + orbSize + nudgeGap,
  bottom: orbInset + orbSize / 2,
  transform: 'translateY(50%)',
  zIndex: theme.zIndex.speedDial,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 20,
  paddingLeft: theme.spacing(2),
  // A small tail that points at the orb
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 12,
    height: 12,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    boxShadow: '2px -2px 2px rgba(0, 0, 0, 0.06)',
  },
  '@media print': {
    display: 'none',
  },
}));

const NudgeText = styled(ButtonBase)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1.25, 0),
  borderRadius: theme.shape.borderRadius,
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.main}`,
  },
}));

export const AssistantOrb: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const { launcher, launch, firstRunDialog } = useAssistantLaunch();
  const { open } = useAssistantContext();
  const orbRef = useRef<HTMLButtonElement>(null);
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
    <>
      {nudge.show && (
        <Nudge elevation={3}>
          <NudgeText onClick={openGuide}>
            {t('Need a hand with {{appName}}?', { appName })}
          </NudgeText>
          <IconButton
            size="small"
            aria-label={t('Dismiss')}
            onClick={nudge.dismiss}
            sx={{ mx: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Nudge>
      )}
      <OrbButton
        ref={orbRef}
        data-animating={open || undefined}
        centerRipple
        aria-label={t('Open {{appName}} Guide', { appName })}
        onClick={openGuide}
      />
      {firstRunDialog}
    </>
  );
};
