import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useMinisterHousingAllowance } from '../../Shared/MinisterHousingAllowanceContext';
import { PageEnum } from '../../Shared/sharedTypes';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';
import { CalculationFormValues } from '../Steps/StepThree/Calculation';

interface DirectionButtonsProps {
  handleNext?: () => void;
  isCalculate?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  handleNext,
  isCalculate,
}) => {
  const { t } = useTranslation();

  const {
    handleNextStep,
    handlePreviousStep,
    pageType,
    handleEditNextStep,
    handleEditPreviousStep,
  } = useMinisterHousingAllowance();

  const { submitForm, validateForm, submitCount, isValid } =
    useFormikContext<CalculationFormValues>();
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleConfirm = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setOpenConfirmation(true);
    } else {
      submitForm();
    }
  };

  const isNew = pageType === PageEnum.New;

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
      {isCalculate ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.400',
              },
            }}
            onClick={isNew ? handlePreviousStep : handleEditPreviousStep}
          >
            <ChevronLeft sx={{ mr: 1 }} />
            <b>{t('Back')}</b>
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={submitCount > 0 && !isValid}
          >
            {t('Submit')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
          {openConfirmation && (
            <ConfirmationModal
              handleClose={() => setOpenConfirmation(false)}
              handleConfirm={submitForm}
            />
          )}
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={
            handleNext
              ? handleNext
              : isNew
                ? handleNextStep
                : handleEditNextStep
          }
        >
          {t('CONTINUE')}
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      )}
    </Box>
  );
};
