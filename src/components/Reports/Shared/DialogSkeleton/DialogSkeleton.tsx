import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CancelButton } from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import theme from 'src/theme';

export interface DialogSkeletonProps {
  categoryName: string;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const DialogSkeleton: React.FC<DialogSkeletonProps> = ({
  categoryName,
  open,
  onClose,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
      }}
      PaperProps={{
        sx: {
          maxHeight: '700px',
          marginTop: theme.spacing(8),
        },
      }}
    >
      <DialogTitle>{t(`${categoryName} Breakdown`)}</DialogTitle>
      <DialogContent
        sx={{
          padding: theme.spacing(4),
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {children}
      </DialogContent>
      <DialogActions
        sx={{
          padding: theme.spacing(2),
        }}
      >
        <CancelButton data-testid="close-button" onClick={onClose}>
          {t('Close')}
        </CancelButton>
      </DialogActions>
    </Dialog>
  );
};
