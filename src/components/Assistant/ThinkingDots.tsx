import React from 'react';
import { keyframes } from '@emotion/react';
import { alpha, styled } from '@mui/material/styles';

export const thinkingLoopSeconds = 1.2;

const pulse = keyframes({
  '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
  '40%': { opacity: 1, transform: 'scale(1)' },
});

const Dots = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  height: theme.spacing(2.5),
}));

const Dot = styled('span')(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.text.primary, 0.6),
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${pulse} ${thinkingLoopSeconds}s ease-in-out infinite`,
    '&:nth-of-type(2)': { animationDelay: `${thinkingLoopSeconds / 6}s` },
    '&:nth-of-type(3)': { animationDelay: `${thinkingLoopSeconds / 3}s` },
  },
}));

// The reply announcer says it once, so the dots stay out of the accessibility tree
export const ThinkingDots: React.FC = () => (
  <Dots aria-hidden data-testid="GuideThinking">
    <Dot />
    <Dot />
    <Dot />
  </Dots>
);
