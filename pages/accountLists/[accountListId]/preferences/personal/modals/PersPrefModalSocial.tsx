import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Hidden, Typography, styled } from '@material-ui/core';
import { Facebook, Language, LinkedIn, Twitter } from '@material-ui/icons';

import {
  PersPrefFieldWrapper,
  StyledOutlinedInput,
} from '../shared/PersPrefForms';
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
  savedData?: string;
}

const MediaRow: React.FC<MediaRowProps> = ({ localData, savedData }) => {
  const { t } = useTranslation();

  return (
    <StyledGridContainer container spacing={2}>
      <StyledGridItem item xs={12} sm={8}>
        <PersPrefFieldWrapper>
          <StyledOutlinedInput
            value={savedData}
            type={localData.inputType}
            placeholder={localData.placeholder}
          />
        </PersPrefFieldWrapper>
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={3}>
        <PersPrefFieldWrapper formControlDisabled={true}>
          <StyledOutlinedInput value={t(localData.mediaType)} />
        </PersPrefFieldWrapper>
      </StyledGridItem>
      <StyledGridItem item xs={12} sm={1}>
        <DeleteButton />
      </StyledGridItem>
    </StyledGridContainer>
  );
};

export const PersPrefModalSocial: React.FC = () => {
  const { t } = useTranslation();

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
          <SectionHeading>{t('Social Connections')}</SectionHeading>
        </Grid>
        <Hidden xsDown>
          <OptionHeadings smallCols={3} align="flex-start">
            {t('Type')}
          </OptionHeadings>
          <OptionHeadings smallCols={1}>{t('Delete')}</OptionHeadings>
        </Hidden>
      </Grid>
      {connections.map((current) =>
        current.data.map((current2, index) => (
          <MediaRow localData={current} savedData={current2} key={index} />
        )),
      )}
      <MediaRow localData={connections[0]} />
      <AddButtonBox>
        <Typography component="span">
          <strong>{t('Add')}:</strong>
        </Typography>
        {connections.map((current, index) => (
          <StyledButton
            startIcon={current.icon}
            size="small"
            variant="outlined"
            key={index}
            disableRipple
          >
            {t(current.mediaType)}
          </StyledButton>
        ))}
      </AddButtonBox>
    </>
  );
};
