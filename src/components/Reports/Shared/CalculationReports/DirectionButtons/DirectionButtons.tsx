import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../SubmitModal/SubmitModal';

interface DirectionButtonsProps {
  handleNextStep?: () => void;
  handlePreviousStep?: () => void;
  handleCancel?: () => void;
  buttonTitle?: string;
  deadlineDate?: string;
  actionRequired?: boolean;
  overrideNext?: () => void;
  showBackButton?: boolean;
  disabled?: boolean;
  //Formik validation for submit modal
  isSubmission?: boolean;
  submitForm?: () => Promise<void>;
  validateForm?: () => Promise<Record<string, string>>;
  submitCount?: number;
  isValid?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  handleNextStep,
  handlePreviousStep,
  handleCancel,
  buttonTitle,
  isSubmission,
  overrideNext,
  showBackButton,
  submitForm,
  validateForm,
  submitCount,
  isValid,
  deadlineDate,
  actionRequired,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const [openSubmitModal, setOpenSubmitModal] = useState(false);

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

  const handleConfirm = () => {
    if (submitForm) {
      submitForm();
    }
    setOpenSubmitModal(false);
  };

  return (
    <Box
      sx={{
        mt: 5,
        display: 'flex',
        justifyContent: handleCancel ? 'space-between' : 'flex-end',
      }}
    >
      {handleCancel && (
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={handleCancel}
        >
          {t('Cancel')}
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
            disabled={disabled}
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
            disabled={submitCount ? !isValid || disabled : disabled}
          >
            {t('Submit')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={overrideNext ?? handleNextStep}
            disabled={disabled}
          >
            {buttonTitle ?? t('Continue')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        )}
      </Box>
      {openSubmitModal && (
        <SubmitModal
          formTitle={t('MHA Request')}
          handleClose={() => setOpenSubmitModal(false)}
          handleConfirm={handleConfirm}
          deadlineDate={deadlineDate}
          actionRequired={actionRequired}
        />
      )}
    </Box>
  );
};
