import { useRouter } from 'next/router';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';
import { CalculationFormValues } from '../Steps/StepThree/Calculation';

interface DirectionButtonsProps {
  handleNext?: () => void;
  handleBack?: () => void;
  isCalculate?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  handleNext,
  handleBack,
  isCalculate,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();

  const { submitForm, validateForm } =
    useFormikContext<CalculationFormValues>();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const handleConfirm = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setOpenConfirmation(true);
    } else {
      submitForm();
    }
  };

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
      <Button sx={{ color: 'error.light' }} onClick={() => setOpenCancel(true)}>
        <b>{t('CANCEL')}</b>
      </Button>
      {openCancel && (
        <ConfirmationModal
          handleClose={() => setOpenCancel(false)}
          handleConfirm={() =>
            router.push(
              `/accountLists/${accountListId}/reports/housingAllowance`,
            )
          }
          isCancel={true}
        />
      )}
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
            onClick={handleBack}
          >
            <ChevronLeft sx={{ mr: 1 }} />
            <b>{t('Back')}</b>
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirm}>
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
        <Button variant="contained" color="primary" onClick={handleNext}>
          {t('CONTINUE')}
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      )}
    </Box>
  );
};
