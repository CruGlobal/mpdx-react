import React from 'react';
import { IconButton, List, ListItem, styled } from '@material-ui/core';
import { Facebook, Language, LinkedIn, Twitter } from '@material-ui/icons';

const StyledList = styled(List)({
  fontSize: '0',
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'inline-block',
  width: 'auto',
  marginRight: theme.spacing(1),
  padding: '0',
  '&:last-child': {
    marginRight: '0',
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

const StyledSocialButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'transparent',
  },
})) as typeof IconButton;

const profileTypes = {
  facebook: {
    link: 'https://www.facebook.com/',
    icon: <Facebook />,
  },
  twitter: {
    link: 'https://www.twitter.com/',
    icon: <Twitter />,
  },
  linkedin: {
    link: '',
    icon: <LinkedIn />,
  },
  websites: {
    link: '',
    icon: <Language />,
  },
};

interface ListItemProps {
  accounts: string[];
  type: keyof typeof profileTypes;
}

const ListItemLinks: React.FC<ListItemProps> = ({ accounts, type }) => {
  const { link, icon } = profileTypes[type];

  return (
    <>
      {accounts.map((account) => (
        <StyledListItem key={`${type}-${account}`} disableGutters button>
          <StyledSocialButton
            href={`${link}${account}`}
            color="primary"
            target="_blank"
            disableRipple
          >
            {icon}
          </StyledSocialButton>
        </StyledListItem>
      ))}
    </>
  );
};

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
  return (
    <StyledList disablePadding>
      <ListItemLinks accounts={facebook_accounts} type="facebook" />
      <ListItemLinks accounts={twitter_accounts} type="twitter" />
      <ListItemLinks accounts={linkedin_accounts} type="linkedin" />
      <ListItemLinks accounts={websites} type="websites" />
    </StyledList>
  );
};
