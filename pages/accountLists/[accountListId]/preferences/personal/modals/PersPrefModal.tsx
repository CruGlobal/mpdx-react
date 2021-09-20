import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  DialogContent,
  Tab,
  Tabs,
  styled,
} from '@material-ui/core';
import Modal from '../../../../../../src/components/common/Modal/Modal';
import { StyledDialogActions } from './PersPrefModalShared';
import { PersPrefModalContact } from './PersPrefModalContact';
import { PersPrefModalDetails } from './PersPrefModalDetails';
import { PersPrefModalSocial } from './PersPrefModalSocial';
import { PersPrefModalRelationships } from './PersPrefModalRelationships';
import { PersPrefModalName } from './PersPrefModalName';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
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
  const [openTab, setOpenTab] = useState(0);

  const handleChange = (newValue: number) => {
    setOpenTab(newValue);
  };

  const tabData = [
    { label: 'Contact Info', data: <PersPrefModalContact /> },
    { label: 'Details', data: <PersPrefModalDetails /> },
    { label: 'Social', data: <PersPrefModalSocial /> },
    { label: 'Relationships', data: <PersPrefModalRelationships /> },
  ];

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
          <StyledAppBar position="static">
            <StyledTabs value={openTab} onChange={handleChange}>
              {tabData.map((current, index) => (
                <StyledTab label={t(current.label)} disableRipple key={index} />
              ))}
            </StyledTabs>
          </StyledAppBar>
          {tabData.map((current, index) => (
            <div
              role="tabpanel"
              hidden={openTab !== index}
              id={`tabpanel-${index}`}
              key={index}
            >
              {openTab === index && <Box>{current.data}</Box>}
            </div>
          ))}
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button variant="contained" color="primary">
            {t('Save')}
          </Button>
        </StyledDialogActions>
      </form>
    </Modal>
  );
};
