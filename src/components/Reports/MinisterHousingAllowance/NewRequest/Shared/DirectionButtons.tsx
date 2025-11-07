import { useRouter } from 'next/router';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, DeleteSharp } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PageEnum } from '../../Shared/sharedTypes';
import { CancelModal } from '../CancelModal/CancelModal';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';
import { CalculationFormValues } from '../Steps/StepThree/Calculation';

interface DirectionButtonsProps {
  type: PageEnum;
  handleNext?: () => void;
  handleBack?: () => void;
  isCalculate?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  type,
  handleNext,
  handleBack,
  isCalculate,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const router = useRouter();

  const { submitForm, validateForm } =
    useFormikContext<CalculationFormValues>();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleConfirm = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setOpenConfirmation(true);
    } else {
      submitForm();
    }
  };

  const isEdit = type === PageEnum.Edit;

  return (
    <Box
      sx={{
        mt: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {type === PageEnum.New ? (
        <Button
          sx={{ color: 'error.light' }}
          onClick={() => setOpenCancel(true)}
        >
          <b>{t('CANCEL')}</b>
        </Button>
      ) : (
        <Button
          sx={{ color: 'error.light' }}
          onClick={() => setOpenDelete(true)}
        >
          <DeleteSharp sx={{ mr: 1 }} />
          <b>{t('Delete Your Request')}</b>
        </Button>
      )}

      {isEdit && !isCalculate && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            sx={{ color: 'error.light' }}
            onClick={() => setOpenCancel(true)}
          >
            <b>{t('CANCEL')}</b>
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {t('CONTINUE')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        </Box>
      )}

      {isCalculate && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEdit && (
            <Button
              sx={{ color: 'error.light' }}
              onClick={() => setOpenCancel(true)}
            >
              <b>{t('CANCEL')}</b>
            </Button>
          )}
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
        </Box>
      )}

      {openDelete && (
        <CancelModal
          type={type}
          handleClose={() => setOpenDelete(false)}
          handleConfirm={() =>
            router.push(
              `/accountLists/${accountListId}/reports/housingAllowance`,
            )
          }
          isDelete
        />
      )}
      {openCancel && (
        <CancelModal
          type={type}
          handleClose={() => setOpenCancel(false)}
          handleConfirm={() =>
            router.push(
              `/accountLists/${accountListId}/reports/housingAllowance`,
            )
          }
        />
      )}
      {openConfirmation && (
        <ConfirmationModal
          type={type}
          handleClose={() => setOpenConfirmation(false)}
          handleConfirm={submitForm}
        />
      )}
    </Box>
  );
};
