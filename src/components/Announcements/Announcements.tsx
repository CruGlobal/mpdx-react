import React, { useContext, useEffect, useMemo } from 'react';
import { getApolloContext } from '@apollo/client';
import { Close } from '@mui/icons-material';
import { Button, Icon, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { DisplayMethodEnum } from 'pages/api/graphql-rest.page.generated';
import { AlertBanner } from 'src/components/Shared/alertBanner/AlertBanner';
import { ActionStyleEnum, StyleEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { useAnnouncementsQuery } from './Announcements.generated';

const Banner = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  boxShadow: `0px 7px 6px -3px ${theme.palette.cruGrayDark.main}`,
  position: 'fixed',
  zIndex: 1000,
  color: theme.palette.common.white,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const BannerDetails = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(2),

  ['@media (min-width:500px)']: {},
}));

const BannerItem = styled(Box)(() => ({
  maxWidth: '50%',
  ['@media (max-width:500px)']: {
    maxWidth: '100%',
  },
}));

const ButtonContainer = styled(Box)(() => ({
  width: '45px',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.cruGrayLight.main,
}));

const createAnnouncementStyles = (announcementStyle?: StyleEnum | null) => {
  const defaultStyles = {
    background: theme.palette.primary.main,
    textAndIconColor: theme.palette.cruGrayLight.main,
  };
  switch (announcementStyle) {
    case StyleEnum.Danger:
      return {
        ...defaultStyles,
        background: theme.palette.error.main,
      };
    case StyleEnum.Success:
      return {
        ...defaultStyles,
        background: theme.palette.success.main,
      };
    case StyleEnum.Warning:
      return {
        background: theme.palette.warning.main,
        textAndIconColor: theme.palette.text.primary,
      };
    case StyleEnum.Default:
    case StyleEnum.Info:
    default:
      return defaultStyles;
  }
};

export const Announcements: React.FC = () => {
  // Use NoApolloBeacon on pages without an <ApolloProvider>
  const hasApolloClient = Boolean(useContext(getApolloContext()).client);

  return hasApolloClient ? (
    <Announcement />
  ) : process.env.ALERT_MESSAGE ? (
    <AlertBanner
      text={process.env.ALERT_MESSAGE}
      localStorageName="ALERT_MESSAGE"
    />
  ) : null;
};

const Announcement: React.FC = () => {
  const { t } = useTranslation();

  const { data } = useAnnouncementsQuery();

  const announcement = useMemo(() => {
    if (data?.announcements) {
      return data.announcements[0];
    }
    return null;
  }, [data]);

  // The `useEffect` hook is used to dynamically load FontAwesome styles when the announcement's display method is a banner.
  // This ensures that the styles are only loaded when necessary and are cleaned up when the component is unmounted or the
  // announcement changes.
  useEffect(() => {
    if (
      !announcement ||
      announcement.displayMethod !== DisplayMethodEnum.Banner
    ) {
      return;
    }
    const hasBeenLoaded = document.querySelector(
      'link[id="fontAwesomeStyles"]',
    );
    if (!hasBeenLoaded) {
      const fontAwesomeStyles = document.createElement('link');
      fontAwesomeStyles.rel = 'stylesheet';
      fontAwesomeStyles.id = 'fontAwesomeStyles';
      fontAwesomeStyles.href =
        'https://use.fontawesome.com/releases/v5.14.0/css/all.css';
      document.head.appendChild(fontAwesomeStyles);
    }

    return () => {
      const fontAwesomeStyles = document.querySelector(
        'link[id="fontAwesomeStyles"]',
      );
      if (fontAwesomeStyles) {
        document.head.removeChild(fontAwesomeStyles);
      }
    };
  }, [announcement]);

  const { background, textAndIconColor } = createAnnouncementStyles(
    announcement?.style,
  );

  if (!announcement) {
    return null;
  }

  return announcement.displayMethod === DisplayMethodEnum.Banner ? (
    <Banner sx={{ background: background }}>
      <BannerDetails>
        <BannerItem>
          <Typography variant="body1">{announcement.title}</Typography>
          <Typography variant="body2">{announcement.body}</Typography>
        </BannerItem>
        <BannerItem>
          {announcement.actions.map((action) =>
            action.style === ActionStyleEnum.Icon ? (
              <IconButton sx={{ color: textAndIconColor, marginRight: 1 }}>
                <Icon baseClassName="fas" className={`fa-${action.label}`} />
              </IconButton>
            ) : (
              <Button variant="contained" color="primary">
                {action.label}
              </Button>
            ),
          )}
        </BannerItem>
      </BannerDetails>
      <ButtonContainer>
        <StyledIconButton sx={{ color: textAndIconColor }}>
          <Close titleAccess={t('Hide announcement')} />
        </StyledIconButton>
      </ButtonContainer>
    </Banner>
  ) : (
    <Box>Modal</Box>
  );
};
