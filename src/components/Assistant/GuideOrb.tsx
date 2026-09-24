import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

export const orbSize = 56;
export const orbInset = 24;

const orbBackground = [
  'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%)',
  'radial-gradient(circle at 68% 68%, rgba(0, 192, 216, 0.95) 0%, rgba(0, 192, 216, 0) 52%)',
  'radial-gradient(circle at 50% 45%, #1784b8 0%, #05699b 55%, #033a57 100%)',
].join(', ');

const orbGlow = '0 0 14px 3px rgba(0, 192, 216, 0.45)';

const breathe = keyframes({
  '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
  '50%': { transform: 'scale(1.04)', filter: 'brightness(1.12)' },
});

// Only an open Guide moves, so a closed launcher never pulls the eye
const breathing = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-animating="true"]': {
      animation: `${breathe} 3s ease-in-out infinite`,
    },
  },
};

export const GuideOrb = styled('span', {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: number }>(({ size }) => ({
  display: 'inline-block',
  flexShrink: 0,
  width: size,
  height: size,
  borderRadius: '50%',
  background: orbBackground,
  boxShadow: orbGlow,
  ...breathing,
}));

export const orbButtonStyles = {
  width: orbSize,
  height: orbSize,
  borderRadius: '50%',
  background: orbBackground,
  boxShadow: `${orbGlow}, 0 4px 12px rgba(0, 0, 0, 0.25)`,
  ...breathing,
};
