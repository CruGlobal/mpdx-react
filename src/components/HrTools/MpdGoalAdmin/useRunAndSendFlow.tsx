import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from './MpdGoalAdminContext';
import { RunAndSendModalProps } from './RunAndSendModal/RunAndSendModal';
import { StaffGoalRow, partitionSendable } from './mpdGoalAdminHelpers';

interface OpenOptions {
  /** False for the per-row action, whose target is one row, not the selection. */
  clearsSelection?: boolean;
}

export interface RunAndSendFlow {
  /** Opens the confirmation for `rows`; the send itself waits on the confirm. */
  openRunAndSend: (
    title: string,
    rows: StaffGoalRow[],
    options?: OpenOptions,
  ) => void;
  /** Spread onto a single `RunAndSendModal` rendered by the caller. */
  modalProps: RunAndSendModalProps;
}

/** The confirm-then-send flow shared by all three Run & Send entry points. */
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
    clearsSelection: boolean;
  }>({ title: '', rows: [], clearsSelection: true });

  const openRunAndSend = (
    title: string,
    rows: StaffGoalRow[],
    { clearsSelection = true }: OpenOptions = {},
  ) => {
    setTarget({ title, rows, clearsSelection });
    setOpen(true);
  };

  const handleConfirm = async () => {
    // Explicit ids keep the send to what the modal previewed, but a withdrawn id fails the whole batch.
    const { sendable } = partitionSendable(target.rows);
    setSending(true);
    let sentCount: number;
    try {
      sentCount = await runAndSend(sendable.map((row) => row.id));
    } catch {
      // The global Apollo error link already toasts; stay open to retry.
      return;
    } finally {
      setSending(false);
    }

    // Zero means every row went stale server-side, which is not a success.
    if (sentCount === 0) {
      enqueueSnackbar(t('No MPD goals were eligible to send.'), {
        variant: 'info',
      });
      return;
    }

    enqueueSnackbar(
      t('{{count}} MPD Goals were run and sent.', { count: sentCount }),
      { variant: 'success' },
    );
    if (target.clearsSelection) {
      clearSelection();
    }
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
