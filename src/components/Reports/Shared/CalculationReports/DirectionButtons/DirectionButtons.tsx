import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
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
  isEdit?: boolean;
  exceedsCap?: boolean;
  disableSubmit?: boolean;
  //Formik validation for submit modal
  isSubmission?: boolean;
  submitForm?: () => Promise<void>;
  validateForm?: () => Promise<Record<string, string>>;
  submitCount?: number;
  isValid?: boolean;
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
  submitForm,
  validateForm,
  submitCount,
  isValid,
  deadlineDate,
  actionRequired,
  exceedsCap,
  disableSubmit,
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

  return (
    <Box
      sx={{
        mt: 5,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {handleDiscard && (
        <Button
          sx={{ color: 'error.light', px: 2, py: 1, fontWeight: 'bold' }}
          onClick={() => setOpenDiscardModal(true)}
        >
          {isEdit ? t('Discard Changes') : t('Discard')}
        </Button>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        {showBackButton && (
          <Button
            variant="contained"
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
            <ChevronLeft sx={{ mr: 1 }} />
            {t('Back')}
          </Button>
        )}
        {isSubmission ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitCount ? !isValid : false}
          >
            {t('Submit')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={overrideNext ?? handleNextStep}
          >
            {buttonTitle ?? t('Continue')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        )}
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
          exceedsCap={exceedsCap}
          disableSubmit={disableSubmit}
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
