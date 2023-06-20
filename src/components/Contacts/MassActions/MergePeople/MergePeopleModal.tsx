import {
  Alert,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Person } from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import { useMassActionsMergePeopleMutation } from './MergePeople.generated';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface MergePeopleModalProps {
  people: Pick<Person, 'id' | 'firstName' | 'lastName'>[];
  accountListId: string;
  handleClose: () => void;
}

export const MergePeopleModal: React.FC<MergePeopleModalProps> = ({
  handleClose,
  accountListId,
  people,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [winnerId, setWinnerId] = useState(people[0].id);

  const [mergePeople, { loading: merging }] =
    useMassActionsMergePeopleMutation();

  const handleMerge = async () => {
    const loserIds = people
      .map((person) => person.id)
      .filter((id) => id !== winnerId);
    await mergePeople({
      variables: {
        accountListId,
        winnerId,
        loserIds,
      },
      update: (cache) => {
        // Delete the loser people and remove dangling references to them
        loserIds.forEach((id) => {
          cache.evict({ id: `Person:${id}` });
        });
        cache.gc();
      },
    });
    enqueueSnackbar(t('People merged!'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal title={t('Merge People')} isOpen={true} handleClose={handleClose}>
      <DialogContent data-testid="MergeModal">
        <Alert
          severity="warning"
          sx={(theme) => ({
            marginBottom: theme.spacing(2),
          })}
        >
          {t('This action cannot be undone!')}
        </Alert>
        <Typography variant="subtitle1">
          {t('Are you sure you want to merge the selected people?')}
        </Typography>
        <Typography variant="subtitle1">
          {t(
            'Data from the "losers" will get copied to the "winner". Select the winner below. No data will be lost by merging.',
          )}
        </Typography>
        {people.map((person) => (
          <Box
            my={2}
            p={2}
            key={person.id}
            onClick={() => setWinnerId(person.id)}
            aria-selected={winnerId === person.id}
            sx={(theme) => ({
              display: 'flex',
              gap: theme.spacing(2),
              cursor: 'pointer',
              borderWidth: 3,
              borderStyle: 'solid',
              borderColor:
                winnerId === person.id
                  ? theme.palette.mpdxGreen.main
                  : theme.palette.cruGrayLight.main,
            })}
            data-testid="MergePeopleModalPerson"
          >
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              {person.firstName} {person.lastName}
            </Typography>
            {winnerId === person.id && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  sx={(theme) => ({
                    backgroundColor: theme.palette.mpdxGreen.main,
                    color: 'white',
                    padding: theme.spacing(0.5),
                    margin: theme.spacing(-2),
                  })}
                  variant="subtitle2"
                >
                  {t('Use This One')}
                </Typography>
                <Box sx={{ flex: 1 }} />
              </Box>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={merging} />
        <SubmitButton onClick={handleMerge} disabled={merging}>
          {merging && <CircularProgress color="primary" size={20} />}
          {t('Merge')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
