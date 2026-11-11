import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { coachLabel } from '../../Shared/AssignCoach/coachHelpers';
import { AddMpdCoachModal } from './AddMpdCoachModal';
import {
  useNewStaffMpdCoachesQuery,
  useRemoveNewStaffMpdCoachMutation,
} from './MpdCoaches.generated';
import { MpdCoachRow, MpdCoachesTable } from './MpdCoachesTable';
import { evictAssignableCoaches } from './mpdCoachesCache';

const CoachList: React.FC<{
  onRemove: (coach: MpdCoachRow) => void;
}> = ({ onRemove }) => {
  const { t } = useTranslation();
  const { data, loading, error } = useNewStaffMpdCoachesQuery();
  const coaches = data?.newStaffMpdCoaches ?? [];

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress aria-label={t('Loading MPD coaches')} />
      </Box>
    );
  }
  if (!coaches.length) {
    return (
      <Box role="status" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="text.secondary">
          {t(
            'No MPD coaches have been added yet. Add a coach so they can be assigned to new staff.',
          )}
        </Typography>
      </Box>
    );
  }
  return <MpdCoachesTable coaches={coaches} onRemove={onRemove} />;
};

/** The New Staff MPD coach list the Assign Coach pickers offer. MPD Goals team only. */
export const MpdCoaches: React.FC = () => {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  // Kept through the close transition so the message doesn't flash empty.
  const [removeTarget, setRemoveTarget] = useState<MpdCoachRow | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeCoach] = useRemoveNewStaffMpdCoachMutation();

  const handleRemove = async () => {
    if (!removeTarget) {
      return;
    }
    await removeCoach({
      variables: { id: removeTarget.id },
      update: (cache) => {
        cache.evict({ id: `NewStaffMpdCoach:${removeTarget.id}` });
        evictAssignableCoaches(cache);
        cache.gc();
      },
    });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">{t('MPD Coaches')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              'The coaches you can assign to new staff. Removing a coach does not change the staff they already coach.',
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAdding(true)}
        >
          {t('Add Coach')}
        </Button>
      </Box>

      <CoachList
        onRemove={(coach) => {
          setRemoveTarget(coach);
          setRemoveOpen(true);
        }}
      />

      <Confirmation
        isOpen={removeOpen}
        title={t('Remove Coach')}
        message={t(
          'Remove {{name}} from the MPD coach list? Staff they already coach keep them as their coach.',
          { name: removeTarget ? coachLabel(removeTarget, t) : '' },
        )}
        mutation={handleRemove}
        confirmButtonProps={{ variant: 'contained', color: 'error' }}
        handleClose={() => setRemoveOpen(false)}
      />

      {adding && <AddMpdCoachModal handleClose={() => setAdding(false)} />}
    </>
  );
};
