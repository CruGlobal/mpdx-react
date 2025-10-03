import { useState } from 'react';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import {
  MobileDatePicker,
  PickersActionBar,
  PickersActionBarProps,
} from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { ActionTypeEnum } from '../mockData';
import { CalendarTypeProvider } from './CalendarContext/CalendarTypeContext';
import { CalendarTitle } from './CalendarTitle';

interface CustomEditCalendarProps {
  open?: boolean;
  value: DateTime | null;
  onChange: (date: DateTime | null) => void;
  onClose?: () => void;
  onAccept?: (date: DateTime | null) => void;
  minDate?: DateTime;
  type: ActionTypeEnum | undefined;
}

function ConfirmClear(props: PickersActionBarProps) {
  const { onClear } = props;
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const handleRequestClear = () => setOpen(true);
  const handleConfirm = () => {
    setOpen(false);
    onClear?.();
  };
  const handleCancel = () => setOpen(false);

  return (
    <>
      <Modal
        isOpen={open}
        handleClose={handleCancel}
        title={t('Confirm Clear')}
      >
        <DialogContent dividers>
          <DialogContentText component={'div'}>
            {t(
              'Are you sure you want to remove this end date? This transfer will continue indefinitely.',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleCancel}>{t('No')}</CancelButton>
          <SubmitButton variant="contained" onClick={handleConfirm}>
            {t('Yes')}
          </SubmitButton>
        </DialogActions>
      </Modal>

      <PickersActionBar {...props} onClear={handleRequestClear} />
    </>
  );
}

export const CustomEditCalendar: React.FC<CustomEditCalendarProps> = ({
  open,
  value,
  onChange,
  onClose,
  onAccept,
  minDate,
  type,
}) => {
  return (
    <CalendarTypeProvider type={type ?? ActionTypeEnum.Add}>
      <MobileDatePicker<DateTime>
        open={open}
        value={value}
        onChange={onChange}
        onClose={onClose}
        onAccept={onAccept}
        minDate={minDate}
        slots={{
          toolbar: CalendarTitle,
          actionBar: ConfirmClear,
        }}
        slotProps={{
          textField: {
            sx: { display: 'none' },
          },
          actionBar: {
            actions: ['accept', 'cancel', 'clear'],
          },
        }}
      />
    </CalendarTypeProvider>
  );
};
