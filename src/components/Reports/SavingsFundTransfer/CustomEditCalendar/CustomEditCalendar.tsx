import { useState } from 'react';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
} from '@mui/material';
import {
  DatePickerToolbarProps,
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
import { useLocale } from 'src/hooks/useLocale';
import { dayMonthFormat } from 'src/lib/intlFormat';
import { ActionTypeEnum } from '../mockData';

type CalendarTitleProps = DatePickerToolbarProps<DateTime> & {
  type: ActionTypeEnum | undefined;
};
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

const CalendarTitle: React.FC<CalendarTitleProps> = ({
  value,
  className,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {type === ActionTypeEnum.Edit ? t('EDIT DATE') : t('ADD DATE')}
      </Typography>
      <Typography variant="body1">{t('Select End Date')}</Typography>
      <Typography variant="h3">
        {value
          ? dayMonthFormat(value.day, value.month, locale, { weekday: 'short' })
          : '--'}
      </Typography>
    </Box>
  );
};

export const CustomEditCalendar: React.FC<CustomEditCalendarProps> = ({
  open,
  value,
  onChange,
  onClose,
  onAccept,
  minDate,
  type,
}) => {
  const Toolbar: React.FC<DatePickerToolbarProps<DateTime>> = (props) => (
    <CalendarTitle {...props} type={type} />
  );

  return (
    <MobileDatePicker<DateTime>
      open={open}
      value={value}
      onChange={onChange}
      onClose={onClose}
      onAccept={onAccept}
      minDate={minDate}
      slots={{ toolbar: Toolbar, actionBar: ConfirmClear }}
      slotProps={{
        textField: {
          sx: { display: 'none' },
        },
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
      }}
    />
  );
};
