import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button, CircularProgress, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../SubmitModal/SubmitModal';

interface DirectionButtonsProps {
  formTitle: string;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: React.ReactNode;
  handleNextStep?: () => void;
  handlePreviousStep?: () => void;
  handleDiscard?: () => void;
  buttonTitle?: string;
  deadlineDate?: string;
  actionRequired?: boolean;
  overrideNext?: () => void;
  showBackButton?: boolean;
  hideNextButton?: boolean;
  isEdit?: boolean;
  additionalApproval?: boolean;
  splitAsr?: boolean;
  disableSubmit?: boolean;
  disableNext?: boolean;
  disabledNextTooltip?: string;
  loadingNext?: boolean;
  loadingNextTitle?: string;
  //Formik validation for submit modal
  isSubmission?: boolean;
  submitForm?: () => Promise<void>;
  validateForm?: () => Promise<Record<string, string>>;
  submitCount?: number;
  isValid?: boolean;
  isSubmitting?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  formTitle,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  handleNextStep,
  handlePreviousStep,
  handleDiscard,
  buttonTitle,
  isEdit,
  isSubmission,
  overrideNext,
  showBackButton,
  hideNextButton,
  submitForm,
  validateForm,
  submitCount,
  isValid,
  isSubmitting,
  deadlineDate,
  actionRequired,
  additionalApproval,
  splitAsr,
  disableSubmit,
  disableNext,
  disabledNextTooltip,
  loadingNext,
  loadingNextTitle,
}) => {
  const { t } = useTranslation();

  const [openSubmitModal, setOpenSubmitModal] = useState(false);
  const [openDiscardModal, setOpenDiscardModal] = useState(false);

  const handleSubmit = async () => {
    if (!submitForm || !validateForm) {
      return;
    }

    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setOpenSubmitModal(true);
    } else {
      submitForm();
    }
  };

  const handleConfirm = async () => {
    if (submitForm) {
      try {
        await submitForm();
      } catch {
        return;
      }
    }
    setOpenSubmitModal(false);
  };

  const handleDiscardConfirm = () => {
    if (handleDiscard) {
      handleDiscard();
    }
    setOpenDiscardModal(false);
  };

  const backButton = showBackButton && (
    <Button
      variant="contained"
      startIcon={<ChevronLeft />}
      sx={{
        bgcolor: 'grey.300',
        color: 'text.primary',
        '&:hover': {
          bgcolor: 'grey.400',
        },
        fontWeight: 'bold',
      }}
      onClick={handlePreviousStep}
    >
      {t('Back')}
    </Button>
  );

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
      {(handleDiscard || showBackButton) && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {handleDiscard ? (
            <Button
              sx={{ color: 'error.light', px: 2, py: 1, fontWeight: 'bold' }}
              onClick={() => setOpenDiscardModal(true)}
            >
              {isEdit ? t('Discard Changes') : t('Discard')}
            </Button>
          ) : (
            backButton
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
        {handleDiscard && backButton}
        {!hideNextButton &&
          (isSubmission ? (
            <Button
              variant="contained"
              color="primary"
              endIcon={<ChevronRight />}
              onClick={handleSubmit}
              disabled={submitCount ? !isValid : false}
            >
              {t('Submit')}
            </Button>
          ) : (
            <Tooltip
              title={
                disableNext && !loadingNext
                  ? (disabledNextTooltip ??
                    t('Complete all fields to continue'))
                  : ''
              }
            >
              <Box component="span">
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={loadingNext ? undefined : <ChevronRight />}
                  startIcon={
                    loadingNext ? <CircularProgress size={20} /> : undefined
                  }
                  onClick={overrideNext ?? handleNextStep}
                  disabled={disableNext || loadingNext}
                >
                  {loadingNext
                    ? (loadingNextTitle ?? buttonTitle ?? t('Continue'))
                    : (buttonTitle ?? t('Continue'))}
                </Button>
              </Box>
            </Tooltip>
          ))}
      </Box>
      {openSubmitModal && (
        <SubmitModal
          formTitle={formTitle}
          handleClose={() => setOpenSubmitModal(false)}
          handleConfirm={handleConfirm}
          overrideTitle={overrideTitle}
          overrideContent={overrideContent}
          overrideSubContent={overrideSubContent}
          deadlineDate={deadlineDate}
          actionRequired={actionRequired}
          additionalApproval={additionalApproval}
          splitAsr={splitAsr}
          disableSubmit={disableSubmit}
          submitting={isSubmitting}
        />
      )}
      {openDiscardModal && (
        <SubmitModal
          formTitle={formTitle}
          handleClose={() => setOpenDiscardModal(false)}
          handleConfirm={handleDiscardConfirm}
          isDiscard={!isEdit}
          isDiscardEdit={isEdit}
        />
      )}
    </Box>
  );
};
