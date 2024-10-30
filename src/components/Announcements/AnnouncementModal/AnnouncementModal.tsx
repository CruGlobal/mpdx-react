import React, { useMemo } from 'react';
import { Box, DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CancelButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import theme from 'src/theme';
import { AnnouncementAction } from '../AnnouncementAction/AnnouncementAction';
import {
  ActionFragment,
  AnnouncementFragment,
} from '../Announcements.generated';

interface AnnouncementModalProps {
  announcement: AnnouncementFragment;
  handlePerformAction: (action?: ActionFragment) => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  handlePerformAction,
}) => {
  const { t } = useTranslation();

  const paragraphs = useMemo(
    () => announcement.body?.split(/\n+/) ?? [],
    [announcement],
  );

  const handleClose = () => {
    handlePerformAction();
  };

  return (
    <Modal
      isOpen={true}
      title={t(announcement.title)}
      handleClose={handleClose}
    >
      <DialogContent dividers>
        {announcement.imageUrl && (
          <Box textAlign="center" mb={2}>
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
              }}
            />
          </Box>
        )}
        {paragraphs.map((paragraph, index) => (
          <Typography key={index} variant="body1">
            {paragraph}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <CancelButton onClick={handleClose}>{t('Close')}</CancelButton>
        <Box>
          {announcement.actions.map((action) => (
            <AnnouncementAction
              key={action.id}
              action={action}
              handlePerformAction={handlePerformAction}
              textAndIconColor={theme.palette.text.primary}
            />
          ))}
        </Box>
      </DialogActions>
    </Modal>
  );
};
