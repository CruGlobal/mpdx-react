import { useRouter } from 'next/router';
import React from 'react';
import { Delete } from '@mui/icons-material';
import { Box, Button, CardActions, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

interface PendingRequestActionsProps {
  calculation: LandingSalaryCalculationsQuery['latestCalculation'];
}

export const PendingRequestActions: React.FC<PendingRequestActionsProps> = ({
  calculation,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();

  const handleView = () => {
    // TODO: implement proper view logic
    router.push(`/accountLists/${accountListId}/reports/salaryCalculator/edit`);
  };

  const handleDelete = () => {
    // TODO: implement delete logic
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
        <Button variant="contained" onClick={handleView}>
          {t('View Request')}
        </Button>
        {calculation?.status === SalaryRequestStatusEnum.ActionRequired && (
          <Button variant="outlined" onClick={handleView}>
            {t('Edit Request')}
          </Button>
        )}
      </Box>
      <IconButton
        onClick={handleDelete}
        sx={{ color: 'error.main' }}
        aria-label={t('Delete request')}
      >
        <Delete />
      </IconButton>
    </CardActions>
  );
};
