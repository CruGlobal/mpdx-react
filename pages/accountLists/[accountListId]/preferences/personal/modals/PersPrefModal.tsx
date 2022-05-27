import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogContent, Tab, styled } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import Modal from '../../../../../../src/components/common/Modal/Modal';
import { StyledDialogActions } from './PersPrefModalShared';
import { PersPrefModalContact } from './PersPrefModalContactInfo';
import { PersPrefModalDetails } from './PersPrefModalDetails';
import { PersPrefModalSocial } from './PersPrefModalSocial';
import { PersPrefModalRelationships } from './PersPrefModalRelationships';
import { PersPrefModalName } from './PersPrefModalName';

const StyledTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-flexContainer > *': {
    flexGrow: 1,
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
  [theme.breakpoints.down('xs')]: {
    '& .MuiTabs-flexContainer': { display: 'block' },
    '& .MuiTabs-indicator': { display: 'none' },
    '& .MuiTab-root': { display: 'block', width: '100%', maxWidth: 'unset' },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: 16,
  borderBottom: `${theme.palette.divider} 2px solid`,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

interface PersPrefModalProps {
  handleClose: () => void;
}

export const PersPrefModal: React.FC<PersPrefModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();
  const [openTab, setOpenTab] = useState('0');

  const handleChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: string,
  ) => {
    setOpenTab(newValue);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit my profile')}
      handleClose={handleClose}
      size={'md'}
    >
      <form>
        <DialogContent dividers>
          <PersPrefModalName />
          <TabContext value={openTab}>
            <StyledTabList onChange={handleChange}>
              <StyledTab value="0" label={t('Contact Info')} disableRipple />
              <StyledTab value="1" label={t('Details')} disableRipple />
              <StyledTab value="2" label={t('Social')} disableRipple />
              <StyledTab value="3" label={t('Relationships')} disableRipple />
            </StyledTabList>
            <TabPanel value="0">
              <PersPrefModalContact />
            </TabPanel>
            <TabPanel value="1">
              <PersPrefModalDetails />
            </TabPanel>
            <TabPanel value="2">
              <PersPrefModalSocial />
            </TabPanel>
            <TabPanel value="3">
              <PersPrefModalRelationships />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleClose} disableElevation disableRipple>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            disableRipple
          >
            {t('Save')}
          </Button>
        </StyledDialogActions>
      </form>
    </Modal>
  );
};
