import React, { useRef } from 'react';
import { ButtonBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { orbButtonStyles, orbInset, orbSize } from './GuideOrb';
import { useHelpjuiceBeaconStyle } from './helpjuiceBeacon';
import { useAssistantLaunch } from './useAssistantLaunch';

const beaconGap = 16;

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

export const AssistantOrb: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const { launcher, launch, firstRunDialog } = useAssistantLaunch();
  const orbRef = useRef<HTMLButtonElement>(null);
  const visible = launcher !== 'hidden';

  // The beacon shares the bottom right corner, so it moves over by the orb's width
  useHelpjuiceBeaconStyle(visible, 'margin-right', `${orbSize + beaconGap}px`);

  if (!visible) {
    return null;
  }

  return (
    <>
      <OrbButton
        ref={orbRef}
        centerRipple
        aria-label={t('Open {{appName}} Guide', { appName })}
        onClick={() => launch(orbRef.current)}
      />
      {firstRunDialog}
    </>
  );
};
