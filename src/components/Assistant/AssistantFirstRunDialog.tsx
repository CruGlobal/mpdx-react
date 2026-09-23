import React, { useState } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/Shared/Modal/Modal';
import { AssistantSettingsUpdateInput } from 'src/graphql/types.generated';
import { getAppName } from 'src/lib/getAppName';
import { useUpdateAssistantSettingsMutation } from './AssistantSettings.generated';

interface AssistantFirstRunDialogProps {
  open: boolean;
  onClose: () => void;
  onEnabled?: () => void;
}

export const AssistantFirstRunDialog: React.FC<
  AssistantFirstRunDialogProps
> = ({ open, onClose, onEnabled }) => {
  const { t } = useTranslation();
  const appName = getAppName();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAssistantSettings] = useUpdateAssistantSettingsMutation();
  const [saving, setSaving] = useState(false);
  const helpCenterUrl =
    process.env.HELPJUICE_KNOWLEDGE_BASE_URL || process.env.HELPJUICE_ORIGIN;

  const save = async (
    attributes: AssistantSettingsUpdateInput,
    onSaved?: () => void,
  ) => {
    setSaving(true);
    try {
      await updateAssistantSettings({ variables: { attributes } });
      onClose();
      onSaved?.();
    } catch {
      enqueueSnackbar(t('Saving failed.'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Pending CON-004 review
  const points = [
    t(
      'The Assistant answers questions about using {{appName}} and links you to the right page.',
      { appName },
    ),
    t(
      'It can see help articles and the page you are on. It cannot see your contacts, gifts, or notes.',
    ),
    t(
      'It never changes your data on its own. Anything it suggests is yours to do or skip.',
    ),
    t('It is an AI, so it can be wrong. Check anything important.'),
    t(
      'What you type is kept in a permanent audit log. Turning the Assistant off deletes your conversations, but not that log.',
    ),
    t(
      'It answers in your language, but the help articles it links to are in English.',
    ),
    t('You can change what it may help with at any time in Preferences.'),
  ];

  return (
    <Modal isOpen={open} title={t('Meet the Assistant')} handleClose={onClose}>
      <DialogContent dividers>
        <List dense disablePadding>
          {points.map((point) => (
            <ListItem key={point} disableGutters>
              <ListItemText primary={point} />
            </ListItem>
          ))}
        </List>
        {helpCenterUrl && (
          <DialogContentText>
            {t('Rather look it up yourself?')}{' '}
            <Link href={helpCenterUrl} target="_blank" rel="noopener">
              {t('Visit the help center')}
            </Link>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          disabled={saving}
          onClick={() => save({ launcherHidden: true })}
        >
          {t('Hide the Assistant button')}
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => save({ enabled: true }, onEnabled)}
        >
          {t('Turn it on')}
        </Button>
      </DialogActions>
    </Modal>
  );
};
