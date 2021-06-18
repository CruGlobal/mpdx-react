import React from 'react';
import type { FC } from 'react';
import Image from 'next/image';

interface LogoProps {
  isDark?: boolean;
  [key: string]: unknown;
}

export const Logo: FC<LogoProps> = ({ isDark, ...props }) => {
  return (
    <Image
      alt="MPDX Logo"
      src={isDark ? '/logo-dark.svg' : '/logo.svg'}
      width={90}
      height={40}
      {...props}
    />
  );
};
