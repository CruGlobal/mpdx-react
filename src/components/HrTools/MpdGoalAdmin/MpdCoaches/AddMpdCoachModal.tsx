import React, { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { searchDebounceMs } from '../mpdGoalAdminHelpers';
import {
  NewStaffMpdCoachCandidatesQuery,
  useAddNewStaffMpdCoachMutation,
  useNewStaffMpdCoachCandidatesQuery,
} from './MpdCoaches.generated';
import { evictAssignableCoaches } from './mpdCoachesCache';

type Candidate =
  NewStaffMpdCoachCandidatesQuery['newStaffMpdCoachCandidates'][number];

const candidateName = (candidate: Candidate): string =>
  `${candidate.firstName} ${candidate.lastName}`;

/** Department and person number tell apart two people with the same name. */
const candidateDetails = (candidate: Candidate): string =>
  [candidate.department, candidate.personNumber].filter(Boolean).join(' · ');

interface AddMpdCoachModalProps {
  handleClose: () => void;
}

export const AddMpdCoachModal: React.FC<AddMpdCoachModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [failed, setFailed] = useState(false);
  const search = useDebouncedValue(inputValue, searchDebounceMs).trim();
  const searchPending = inputValue.trim() !== search;

  const { data, loading } = useNewStaffMpdCoachCandidatesQuery({
    variables: { search },
    skip: !search,
  });
  const [addCoach, { loading: saving }] = useAddNewStaffMpdCoachMutation({
    refetchQueries: ['NewStaffMpdCoaches'],
    update: evictAssignableCoaches,
  });
  const options = search ? (data?.newStaffMpdCoachCandidates ?? []) : [];

  const handleSave = async () => {
    if (!selected) {
      return;
    }
    setFailed(false);
    try {
      await addCoach({ variables: { userId: selected.userId } });
    } catch {
      // Stay open to retry; the global error link toasts the server's reason.
      setFailed(true);
      return;
    }
    handleClose();
  };

  return (
    <Modal
      isOpen
      title={t('Add MPD Coach')}
      handleClose={saving ? () => undefined : handleClose}
      size="sm"
    >
      <DialogContent dividers>
        {failed && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('The coach could not be added. Please try again.')}
          </Alert>
        )}
        <Autocomplete
          autoHighlight
          disabled={saving}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          inputValue={inputValue}
          onInputChange={(_, value) => setInputValue(value)}
          options={options}
          // The server already matched every word, so show what it returned.
          filterOptions={(candidates) => candidates}
          getOptionKey={(candidate) => candidate.id}
          getOptionLabel={candidateName}
          getOptionDisabled={(candidate) => candidate.listed}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={!!search && (loading || searchPending)}
          loadingText={t('Searching…')}
          noOptionsText={
            search
              ? t(
                  'No one found. A coach has to sign in to MPDX once before they can be added.',
                )
              : t('Type a name or person number to search')
          }
          renderOption={({ key, ...props }, candidate) => (
            <li key={key} {...props}>
              <Box>
                <Typography>{candidateName(candidate)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidateDetails(candidate)}
                </Typography>
                {candidate.listed && (
                  <Typography variant="body2" color="text.secondary">
                    {t('Already added')}
                  </Typography>
                )}
              </Box>
            </li>
          )}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('Search')}
              placeholder={t('Name or person number')}
              autoFocus
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={saving}>
          {t('Cancel')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={handleSave}
          disabled={!selected || saving}
        >
          {t('Save')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
