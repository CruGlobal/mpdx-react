import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { thinkingLoopSeconds } from './ThinkingDots';

export const orbSize = 56;
export const orbInset = 24;

// The highlights sit on their own layer so a busy Guide can turn them without turning the orb
const orbHighlights = [
  'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%)',
  'radial-gradient(circle at 68% 68%, rgba(0, 192, 216, 0.95) 0%, rgba(0, 192, 216, 0) 52%)',
].join(', ');

const orbBackground =
  'radial-gradient(circle at 50% 45%, #1784b8 0%, #05699b 55%, #033a57 100%)';

const orbGlow = '0 0 14px 3px rgba(0, 192, 216, 0.45)';
const thinkingGlow = '0 0 22px 8px rgba(0, 192, 216, 0.5)';

const breathe = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.02)' },
});

const turn = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const busyPulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.04)' },
});

// Only an open Guide moves, so a closed launcher never pulls the eye
const breathing = {
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: orbHighlights,
    pointerEvents: 'none',
  },
  '&::after': {
    boxShadow: thinkingGlow,
    opacity: 0,
  },
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-animating="true"]': {
      animation: `${breathe} 4s ease-in-out infinite`,
    },
    '&::before, &::after': {
      transition: 'opacity 0.6s ease-in-out',
    },
    // The turning copy of the highlights fades in over the still one and pauses as it fades out, so nothing snaps
    '&[data-animating="true"][data-busy]::after': {
      animation: `${turn} 7s linear infinite`,
      animationPlayState: 'paused',
    },
    // Busy from send until the reply ends, pulsing in step with the thinking dots' 1.2s loop
    '&[data-animating="true"][data-busy="true"]': {
      animation: `${busyPulse} ${thinkingLoopSeconds}s ease-in-out infinite`,
      '&::before': { opacity: 0 },
      '&::after': { animationPlayState: 'running', opacity: 1 },
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
