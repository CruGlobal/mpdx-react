import React, { useEffect, useState } from 'react';
import { Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { StyleEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { AnnouncementAction } from '../AnnouncementAction/AnnouncementAction';
import {
  ActionFragment,
  AnnouncementFragment,
} from '../Announcements.generated';

const Banner = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  boxShadow: `0px 0px 10px 0px ${
    theme.palette.augmentColor({
      color: { main: theme.palette.cruGrayDark.main },
    }).light
  }`,
  position: 'fixed',
  zIndex: 1000,
  color: theme.palette.common.white,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  top: '-100px',
  transition: 'top 1s ease-in-out 0s',
  '&.show': {
    top: navBarHeight,
  },
}));

const BannerDetails = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(2),

  '@media (max-width:500px)': {
    flexWrap: 'wrap',
  },
}));

const BannerItem = styled(Box)(() => ({
  minWidth: '240px',
  '@media (max-width:500px)': {
    textAlign: 'center',
    width: '100%',
  },
}));

const ButtonContainer = styled(Box)(() => ({
  width: '45px',
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
        background: theme.palette.secondary.main,
        textAndIconColor: theme.palette.text.primary,
      };
    case StyleEnum.Default:
    case StyleEnum.Info:
    default:
      return defaultStyles;
  }
};

interface AnnouncementBannerProps {
  announcement: AnnouncementFragment;
  handlePerformAction: (action?: ActionFragment) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcement,
  handlePerformAction,
}) => {
  const { t } = useTranslation();
  const [shouldAnimateBanner, setShouldAnimateBanner] = useState(false);

  useEffect(() => {
    // Force reflow to ensure the transition is applied
    setTimeout(() => {
      setShouldAnimateBanner(true);
    }, 0);
  }, []);

  const { background, textAndIconColor } = createAnnouncementStyles(
    announcement?.style,
  );
  return (
    <Banner
      sx={{
        background: background,
      }}
      className={shouldAnimateBanner ? 'show' : ''}
    >
      <BannerDetails>
        <Box>
          <Typography variant="body1" sx={{ color: textAndIconColor }}>
            {announcement.title}
          </Typography>
          <Typography variant="body2" sx={{ color: textAndIconColor }}>
            {announcement.body}
          </Typography>
        </Box>
        <BannerItem>
          {announcement.actions.map((action) => (
            <AnnouncementAction
              key={action.id}
              action={action}
              handlePerformAction={handlePerformAction}
              textAndIconColor={textAndIconColor}
              isBanner
            />
          ))}
        </BannerItem>
      </BannerDetails>
      <ButtonContainer>
        <IconButton
          sx={{ color: textAndIconColor }}
          onClick={() => handlePerformAction()}
        >
          <Close titleAccess={t('Hide announcement')} />
        </IconButton>
      </ButtonContainer>
    </Banner>
  );
};
