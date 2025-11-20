import { ChevronRight } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { useMinisterHousingAllowance } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { mocks } from '../../../MinisterHousingAllowance/Shared/mockData';
import { PageEnum } from '../../../MinisterHousingAllowance/Shared/sharedTypes';

interface SubmitModalProps {
  formTitle: string;
  handleClose: () => void;
  handleConfirm: () => void;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: string;
  isCancel?: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  formTitle,
  handleClose,
  handleConfirm,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { pageType } = useMinisterHousingAllowance();

  // TODO: Not sure what text to display if date is null
  const date = mocks[4].mhaDetails.staffMHA?.deadlineDate;
  const deadlineDate = date
    ? dateFormatShort(DateTime.fromISO(date), locale)
    : null;

  const actionRequired = pageType === PageEnum.Edit;

  const title = overrideTitle
    ? overrideTitle
    : isCancel
      ? t('Do you want to cancel?')
      : actionRequired
        ? t(`Are you ready to submit your updated ${formTitle}?`)
        : t(`Are you ready to submit your ${formTitle}?`);

  const contentTitle = overrideContent
    ? overrideContent
    : isCancel
      ? t(`You are cancelling this ${formTitle}.`)
      : actionRequired
        ? t(
            `You are submitting changes to your Annual ${formTitle} for board approval.`,
          )
        : t(`You are submitting your ${formTitle} for board approval.`);

  const contentText = overrideSubContent
    ? overrideSubContent
    : isCancel
      ? t('Your work will not be saved.')
      : actionRequired
        ? t(
            'This updated request will take the place of your previous request. Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.',
            {
              date: deadlineDate,
              interpolation: { escapeValue: false },
            },
          )
        : t(
            `Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.`,
            {
              date: deadlineDate,
              interpolation: { escapeValue: false },
            },
          );

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={isCancel ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>{contentTitle}</b>
            {contentText}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{isCancel ? t('NO') : t('GO BACK')}</b>
        </Button>
        <Button onClick={handleConfirm} color={isCancel ? 'error' : 'primary'}>
          <b>{isCancel ? t('Yes, Cancel') : t('Yes, Continue')}</b>
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
