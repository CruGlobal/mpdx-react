import React from 'react';
import { Box, Divider, styled, Typography } from '@material-ui/core';
import { EcoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface CoachingDetailProps {
  coachingId: string;
}

const CoachingDetailContainer = styled(Box)(({}) => ({
  width: '100&',
  height: '100%',
  display: 'flex',
}));

const CoachingSideContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  flexGrow: 1,
  padding: theme.spacing(1),
}));

const CoachingSideTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1),
  alignItems: 'center',
  alignContent: 'center',
}));

const CoachingMainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  flexGrow: 4,
}));

export const CoachingDetail: React.FC<CoachingDetailProps> = ({
  coachingId,
}) => {
  const { t } = useTranslation();
  console.log(coachingId);
  return (
    <CoachingDetailContainer>
      <CoachingSideContainer bgcolor={theme.palette.progressBarGray.main}>
        <CoachingSideTitleContainer>
          <EcoOutlined
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          />
          <Typography
            variant="h5"
            display="block"
            style={{
              color: theme.palette.primary.contrastText,
              margin: theme.spacing(1),
            }}
          >
            {t('Coaching')}
          </Typography>
        </CoachingSideTitleContainer>
        <Divider style={{ background: theme.palette.primary.contrastText }} />
      </CoachingSideContainer>
      <CoachingMainContainer>Main Section</CoachingMainContainer>
    </CoachingDetailContainer>
  );
};

export default CoachingDetail;
