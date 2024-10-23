import React from 'react';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { AnnouncementFragment } from '../Announcements.generated';

interface AnnouncementModalProps {
  announcement: AnnouncementFragment;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      {t('Modal')} - {announcement.title}
    </Box>
  );
};
