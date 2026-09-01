import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from './MpdGoalAdminContext';
import { RunAndSendModalProps } from './RunAndSendModal/RunAndSendModal';
import { StaffGoalRow, partitionSendable } from './mpdGoalAdminHelpers';

export interface RunAndSendFlow {
  /** Opens the confirmation for `rows`; the send itself waits on the confirm. */
  openRunAndSend: (title: string, rows: StaffGoalRow[]) => void;
  /** Spread onto a single `RunAndSendModal` rendered by the caller. */
  modalProps: RunAndSendModalProps;
}

/**
 * The confirm-then-send flow behind all three Run & Send entry points: the
 * toolbar's "All" button, its "Selected" bulk action, and the per-row action.
 * Each caller renders its own modal but shares this behavior.
 */
export const useRunAndSendFlow = (): RunAndSendFlow => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { runAndSend, clearSelection } = useMpdGoalAdmin();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  // Kept separate so the target rows/title persist through the close transition.
  const [target, setTarget] = useState<{
    title: string;
    rows: StaffGoalRow[];
  }>({ title: '', rows: [] });

  const openRunAndSend = (title: string, rows: StaffGoalRow[]) => {
    setTarget({ title, rows });
    setOpen(true);
  };

  const handleConfirm = async () => {
    // Explicit ids rather than an omitted list, so what the modal previewed is
    // exactly what gets sent even when a search is narrowing the table.
    const { sendable } = partitionSendable(target.rows);
    setSending(true);
    try {
      const sentCount = await runAndSend(sendable.map((row) => row.id));
      enqueueSnackbar(
        t('{{count}} MPD Goals were run and sent.', { count: sentCount }),
        { variant: 'success' },
      );
    } catch {
      // The global Apollo error link already toasts; stay open to retry.
      return;
    } finally {
      setSending(false);
    }
    clearSelection();
    setOpen(false);
  };

  return {
    openRunAndSend,
    modalProps: {
      open,
      title: target.title,
      rows: target.rows,
      sending,
      onClose: () => setOpen(false),
      onConfirm: handleConfirm,
    },
  };
};
