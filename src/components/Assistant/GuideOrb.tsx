import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { thinkingLoopSeconds } from './ThinkingDots';

export const orbSize = 56;
export const orbInset = 24;

const orbBackground = [
  'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%)',
  'radial-gradient(circle at 68% 68%, rgba(0, 192, 216, 0.95) 0%, rgba(0, 192, 216, 0) 52%)',
  'radial-gradient(circle at 50% 45%, #1784b8 0%, #05699b 55%, #033a57 100%)',
].join(', ');

const orbGlow = '0 0 14px 3px rgba(0, 192, 216, 0.45)';
const thinkingGlow = '0 0 22px 8px rgba(0, 192, 216, 0.5)';

const breathe = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.02)' },
});

const thinkingPulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.04)' },
});

// Only an open Guide moves, so a closed launcher never pulls the eye
const breathing = {
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    boxShadow: thinkingGlow,
    opacity: 0,
    pointerEvents: 'none',
  },
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-animating="true"]': {
      animation: `${breathe} 4s ease-in-out infinite`,
    },
    '&::after': {
      transition: 'opacity 0.6s ease-in-out',
    },
    // In step with the thinking dots, which share the 1.2s loop
    '&[data-animating="true"][data-thinking="true"]': {
      animation: `${thinkingPulse} ${thinkingLoopSeconds}s ease-in-out infinite`,
      '&::after': { opacity: 1 },
    },
  },
};

export const GuideOrb = styled('span', {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'sx',
})<{ size: number }>(({ size }) => ({
  display: 'inline-block',
  position: 'relative',
  flexShrink: 0,
  width: size,
  height: size,
  borderRadius: '50%',
  background: orbBackground,
  boxShadow: orbGlow,
  ...breathing,
}));

export const launcherOrbShadow = `${orbGlow}, 0 4px 12px rgba(0, 0, 0, 0.25)`;
