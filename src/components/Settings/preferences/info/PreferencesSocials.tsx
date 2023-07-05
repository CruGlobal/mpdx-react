import React, { ReactNode } from 'react';
import { Box, IconButton, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { Facebook, Language, LinkedIn, Twitter } from '@mui/icons-material';

interface SocialProps {
  accounts: string[];
  icon: ReactNode;
  url?: string;
}

const SocialLinks: React.FC<SocialProps> = ({ accounts, icon, url = '' }) => (
  <>
    {accounts.map((account) => (
      <IconButton
        key={account}
        href={`${url}${account}`}
        color="primary"
        target="_blank"
        sx={{ padding: 0 }}
        disableRipple
      >
        {icon}
      </IconButton>
    ))}
  </>
);

interface SocialMediaProps {
  facebook_accounts: string[];
  twitter_accounts: string[];
  linkedin_accounts: string[];
  websites: string[];
}

export const PersPrefSocials: React.FC<SocialMediaProps> = ({
  facebook_accounts,
  twitter_accounts,
  linkedin_accounts,
  websites,
}) => {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.only('xs'),
  );

  return (
    <Box
      display="flex"
      justifyContent={isMobile ? 'center' : 'start'}
      columnGap={1}
      marginTop={1}
    >
      <SocialLinks
        accounts={facebook_accounts}
        icon={<Facebook />}
        url="https://www.facebook.com/"
      />
      <SocialLinks
        accounts={twitter_accounts}
        icon={<Twitter />}
        url="https://www.twitter.com/"
      />
      <SocialLinks accounts={linkedin_accounts} icon={<LinkedIn />} />
      <SocialLinks accounts={websites} icon={<Language />} />
    </Box>
  );
};
