import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StaffGoalRow, partitionSendable } from '../mpdGoalAdminHelpers';

interface RunAndSendModalProps {
  open: boolean;
  title: string;
  /** The goals targeted by the run-and-send action (all or selected rows). */
  rows: StaffGoalRow[];
  onClose: () => void;
  /** Called with the number of complete goals that will be sent. */
  onConfirm: (sendableCount: number) => void;
}

export const RunAndSendModal: React.FC<RunAndSendModalProps> = ({
  open,
  title,
  rows,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const total = rows.length;
  const { sendable, notSendable: incompleteRows } = partitionSendable(rows);
  const incompleteCount = incompleteRows.length;
  const sendableCount = sendable.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="run-and-send-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        id="run-and-send-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {title}
        <IconButton aria-label={t('Close')} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {incompleteCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              {t('{{incomplete}} of the {{total}} MPD goals cannot be sent.', {
                incomplete: incompleteCount,
                total,
              })}
            </Typography>
            <Typography variant="body2">
              {t(
                'The following staff has incomplete information and cannot be sent at this time. View their details to see what is missing.',
              )}
            </Typography>
            <Box component="ul" sx={{ m: 0, mt: 1, pl: 3 }}>
              {incompleteRows.map((row) => (
                <li key={row.id}>{row.name}</li>
              ))}
            </Box>
          </Alert>
        )}

        <Typography variant="body2">
          {t(
            'Continue with {{sendable}} out of {{total}} MPD goals? This will make this goal active and send it to the staff and their coach.',
            { sendable: sendableCount, total },
          )}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('No, Cancel')}</Button>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          disabled={sendableCount === 0}
          onClick={() => onConfirm(sendableCount)}
        >
          {t('Yes, Continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
