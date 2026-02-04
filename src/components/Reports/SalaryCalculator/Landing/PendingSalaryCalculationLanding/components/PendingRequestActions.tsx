import Link from 'next/link';
import React, { useState } from 'react';
import { Delete } from '@mui/icons-material';
import { Box, Button, CardActions, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from 'src/components/Reports/Shared/CalculationReports/SubmitModal/SubmitModal';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { useDeleteSalaryCalculation } from '../../../Shared/useDeleteSalaryCalculation';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

interface PendingRequestActionsProps {
  calculation: LandingSalaryCalculationsQuery['latestCalculation'];
}

export const PendingRequestActions: React.FC<PendingRequestActionsProps> = ({
  calculation,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { deleteSalaryCalculation } = useDeleteSalaryCalculation();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (calculation) {
      await deleteSalaryCalculation(calculation.id);
    }
  };

  return (
    <CardActions
      sx={{
        paddingInline: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        gap: theme.spacing(1),
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {calculation && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href={`/accountLists/${accountListId}/reports/salaryCalculator/${calculation.id}?mode=view`}
            data-testid="view-request"
          >
            {t('View Request')}
          </Button>
        )}
        {calculation?.status === SalaryRequestStatusEnum.ActionRequired && (
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            href={`/accountLists/${accountListId}/reports/salaryCalculator/${calculation.id}`}
            data-testid="edit-request"
          >
            {t('Edit Request')}
          </Button>
        )}
      </Box>
      {removeDialogOpen && (
        <SubmitModal
          formTitle={t('Salary Calculation')}
          handleClose={() => setRemoveDialogOpen(false)}
          handleConfirm={handleDelete}
          isCancel
        />
      )}
      <IconButton
        onClick={() => setRemoveDialogOpen(true)}
        sx={{ color: 'error.main' }}
        aria-label={t('Delete request')}
      >
        <Delete />
      </IconButton>
    </CardActions>
  );
};
