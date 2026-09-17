import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantProvider';
import { useAssistantVisibility } from './useAssistantVisibility';

const titleId = 'assistant-drawer-title';

const DrawerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100vw',
  [theme.breakpoints.up('sm')]: {
    width: 400,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1, 1, 2),
}));

const MessageArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
}));

export const AssistantDrawer: React.FC = () => {
  const { t } = useTranslation();
  const visible = useAssistantVisibility();
  const { open, closeAssistant } = useAssistantContext();

  if (!visible) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeAssistant}
      slotProps={{
        paper: { role: 'dialog', 'aria-labelledby': titleId },
      }}
    >
      <DrawerContent>
        <Header>
          <Typography id={titleId} variant="h6" component="h2">
            {t('Assistant')}
          </Typography>
          <IconButton
            aria-label={t('Close Assistant')}
            onClick={closeAssistant}
          >
            <CloseIcon />
          </IconButton>
        </Header>
        <Divider />
        <MessageArea>
          <Typography color="text.secondary" align="center">
            {t('Ask a question to get started.')}
          </Typography>
        </MessageArea>
        <Divider />
        <Footer>
          <TextField
            fullWidth
            disabled
            size="small"
            placeholder={t('Ask the assistant')}
          />
          <Typography variant="caption" color="text.secondary">
            {t('The assistant is coming soon.')}
          </Typography>
        </Footer>
      </DrawerContent>
    </Drawer>
  );
};
