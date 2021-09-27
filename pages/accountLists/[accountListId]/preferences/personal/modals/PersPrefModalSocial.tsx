import {
  Button,
  ButtonProps,
  Grid,
  Hidden,
  Typography,
  styled,
} from '@material-ui/core';
import { Facebook, Language, LinkedIn, Twitter } from '@material-ui/icons';
import { ReactElement } from 'react';
import { PersPrefField } from '../shared/PersPrefForms';
import { info } from '../DemoContent';
import {
  AddButtonBox,
  DeleteButton,
  OptionHeadings,
  SectionHeading,
  StyledGridContainer,
  StyledGridItem,
} from './PersPrefModalShared';

const StyledButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    display: 'block',
    width: '100%',
    marginTop: theme.spacing(1),
    '& .MuiButton-label': {
      display: 'flex',
    },
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
  },
}));

interface MediaRowProps {
  localData: {
    data: string[];
    mediaType: string;
    placeholder: string;
    icon: ReactElement;
    inputType: string;
  };
  savedData: string;
}

const MediaRow: React.FC<MediaRowProps> = ({ localData, savedData }) => (
  <StyledGridContainer container spacing={2}>
    <StyledGridItem item xs={12} sm={8}>
      <PersPrefField
        inputType={localData.inputType}
        inputPlaceholder={localData.placeholder}
        inputValue={savedData}
        required
      />
    </StyledGridItem>
    <StyledGridItem item xs={12} sm={3}>
      <PersPrefField inputValue={localData.mediaType} disabled={true} />
    </StyledGridItem>
    <StyledGridItem item xs={12} sm={1}>
      <DeleteButton />
    </StyledGridItem>
  </StyledGridContainer>
);

interface SocialButtonProps {
  icon: ButtonProps['startIcon'];
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, children }) => (
  <StyledButton startIcon={icon} size="small" variant="outlined">
    {children}
  </StyledButton>
);

export const PersPrefModalSocial: React.FC = () => {
  const connections = [
    {
      data: info.facebook_accounts,
      mediaType: 'Facebook',
      placeholder: 'Username *',
      icon: <Facebook />,
      inputType: 'text',
    },
    {
      data: info.twitter_accounts,
      mediaType: 'Twitter',
      placeholder: 'Username *',
      icon: <Twitter />,
      inputType: 'text',
    },
    {
      data: info.linkedin_accounts,
      mediaType: 'LinkedIn',
      placeholder: 'http://linkedin.com/user1234 *',
      icon: <LinkedIn />,
      inputType: 'url',
    },
    {
      data: info.websites,
      mediaType: 'Website',
      placeholder: 'http://example.com *',
      icon: <Language />,
      inputType: 'url',
    },
  ];

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <SectionHeading>Social Connections</SectionHeading>
        </Grid>
        <Hidden xsDown>
          <OptionHeadings smallCols={3} align="left">
            Type
          </OptionHeadings>
          <OptionHeadings smallCols={1}>Delete</OptionHeadings>
        </Hidden>
      </Grid>
      {connections.map((current) =>
        current.data.map((current2, index) => (
          <MediaRow localData={current} savedData={current2} key={index} />
        )),
      )}
      <AddButtonBox>
        <Typography component="span">
          <strong>Add:</strong>
        </Typography>
        {connections.map((current, index) => (
          <SocialButton icon={current.icon} key={index}>
            {current.mediaType}
          </SocialButton>
        ))}
      </AddButtonBox>
    </>
  );
};
