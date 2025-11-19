import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../../../MinisterHousingAllowance/SubmitModal/SubmitModal';

interface DirectionButtonsProps {
  handleNextStep?: () => void;
  handlePreviousStep?: () => void;
  buttonTitle?: string;
  overrideNext?: () => void;
  showBackButton?: boolean;

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
  buttonTitle,
  isSubmission,
  overrideNext,
  showBackButton,
  submitForm,
  validateForm,
  submitCount,
  isValid,
}) => {
  const { t } = useTranslation();

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleConfirm = async () => {
    if (!submitForm || !validateForm) {
      return;
    }

    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setOpenConfirmation(true);
    } else {
      submitForm();
    }
  };

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
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
            onClick={handleConfirm}
            disabled={submitCount ? submitCount > 0 && !isValid : false}
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
      {openConfirmation && (
        <SubmitModal
          handleClose={() => setOpenConfirmation(false)}
          handleConfirm={submitForm ? submitForm : async () => {}}
        />
      )}
    </Box>
  );
};
