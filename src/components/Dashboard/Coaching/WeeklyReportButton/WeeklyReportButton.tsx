import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CoachingQuestionsModal from '../CoachingQuestionsModal/CoachingQuestionsModal';

interface Props {
  accountListId: string;
}

const WeeklyReportButton: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Box>
      <Button onClick={openDrawer}>
        {t('Fill Out Weekly Report').toUpperCase()}
      </Button>
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={drawerOpen}
        closeDrawer={closeDrawer}
      />
    </Box>
  );
};

export default WeeklyReportButton;
