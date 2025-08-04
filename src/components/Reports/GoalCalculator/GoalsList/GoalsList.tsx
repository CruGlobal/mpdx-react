import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, Button, List, ListItem, Typography, styled } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { GoalCard } from '../GoalCard/GoalCard';
import { GoalsListGraphic } from './GoalsListGraphic';

const StyledCreateButton = styled(Button)({
  backgroundColor: 'primary.main',
  color: 'white',
  '&:hover': {
    backgroundColor: 'primary.dark',
  },
});

const StyledLearnButton = styled(Button)({
  borderColor: 'primary.main',
  color: 'primary.main',
  '&:hover': {
    borderColor: 'primary.dark',
    backgroundColor: 'primary.light',
  },
});

const StyledEmptyStateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  marginTop: 4,
  padding: 3,
});

const StyledEmptyStateContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
});

const StyledList = styled(List)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(4),
  padding: 0,
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
}));

const StyledListItem = styled(ListItem)({
  display: 'flex',
  justifyContent: 'center',
  border: 'none',
});

type GoalCardData = {
  goalId: number;
  title: string;
  description: string;
  amount: number;
  date: DateTime;
  starred: boolean;
};

const mockGoalCards: GoalCardData[] = [
  {
    goalId: 1,
    title: 'Initial Support Goal',
    description: 'Reach 50% of monthly support by July.',
    amount: 5000,
    date: DateTime.now().plus({ months: 1 }),
    starred: true,
  },
  {
    goalId: 2,
    title: 'Full Funding',
    description: 'Achieve 100% support by end of year.',
    amount: 10000,
    date: DateTime.now().plus({ months: 6 }),
    starred: false,
  },
  {
    goalId: 3,
    title: 'Special Project',
    description: 'Raise $5,000 for summer outreach.',
    amount: 2000,
    date: DateTime.now().plus({ months: 2 }),
    starred: true,
  },
  {
    goalId: 4,
    title: 'Special Project',
    description: 'Raise $5,000 for summer outreach.',
    amount: 2000,
    date: DateTime.now().plus({ months: 2 }),
    starred: false,
  },
  {
    goalId: 5,
    title: 'Special Project',
    description: 'Raise $5,000 for summer outreach.',
    amount: 2000,
    date: DateTime.now().plus({ months: 2 }),
    starred: true,
  },
];

export const GoalsList: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [goals, setGoals] = React.useState<GoalCardData[]>(mockGoalCards);
  const [deleteGoalDialog, setDeleteGoalDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<GoalCardData | null>(null);

  // You can replace this with actual user name from context/props
  const userName = 'User'; // TODO: Get actual user name

  const handleCreateGoal = () => {
    router.push(
      `${router.asPath}/${GoalCalculatorStepEnum.CalculatorSettings}`,
    );
  };

  const handleStarToggle = (goalId: number) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goalId === goal.goalId ? { ...goal, starred: !goal.starred } : goal,
      ),
    );
  };

  const handleDelete = (goalId: number) => {
    const toDelete = goals.find((goal) => goal.goalId === goalId);
    if (toDelete) {
      setGoalToDelete(toDelete);
      setDeleteGoalDialog(true);
    }
  };

  const handleConfirmGoalDelete = async () => {
    if (goalToDelete) {
      setGoals((prevGoals) =>
        prevGoals.filter((goal) => goal.goalId !== goalToDelete.goalId),
      );
    }
    setDeleteGoalDialog(false);
    Promise.resolve();
  };

  const handleView = () => {
    // TODO
  };

  const handleDeleteDialogCancel = () => {
    setDeleteGoalDialog(false);
    setGoalToDelete(null);
  };

  return (
    <Box sx={{ p: 3, alignSelf: 'center' }}>
      <Confirmation
        title={t('Delete Goal')}
        isOpen={deleteGoalDialog}
        mutation={handleConfirmGoalDelete}
        handleClose={handleDeleteDialogCancel}
        confirmLabel={t('Delete Goal')}
        cancelLabel={t('Cancel')}
        message={
          <>
            {t('Are you sure you want to delete')}{' '}
            <strong>{goalToDelete?.title || ''}</strong>?{' '}
            {t('Deleting this goal will remove it permanently.')}
          </>
        }
        confirmButtonProps={{
          variant: 'contained',
          color: 'error',
          children: t('Delete Goal'),
        }}
      />

      {goals.length === 0 ? (
        <StyledEmptyStateContainer>
          <Box sx={{ flex: '0 0 auto' }}>
            <GoalsListGraphic />
          </Box>
          <StyledEmptyStateContent>
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
              {t('Good Afternoon, {{name}}.', { name: userName })}
            </Typography>

            <Typography sx={{ mb: 3 }}>
              {t('Welcome to the MPD Goal Calculator.')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <StyledCreateButton
                variant="contained"
                onClick={handleCreateGoal}
              >
                {t('Create a New Goal')}
              </StyledCreateButton>

              <StyledLearnButton variant="outlined">
                {t('Learn About Goalsetting')}
              </StyledLearnButton>
            </Box>
          </StyledEmptyStateContent>
        </StyledEmptyStateContainer>
      ) : (
        <>
          <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
            {t('Good Afternoon, {{name}}.', { name: userName })}
          </Typography>

          <Typography sx={{ mb: 3 }}>
            {t('Welcome to the MPD Goal Calculator.')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <StyledCreateButton variant="contained" onClick={handleCreateGoal}>
              {t('Create a New Goal')}
            </StyledCreateButton>

            <StyledLearnButton variant="outlined">
              {/* "Goalsetting" is the term used in the Figma */}
              {t('Learn About Goalsetting')}
            </StyledLearnButton>
          </Box>

          <StyledList>
            {goals.map((goal) => (
              <StyledListItem
                key={goal.goalId}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  border: 'none',
                }}
                disableGutters
              >
                <Box maxWidth={500} width="100%">
                  <GoalCard
                    goalId={goal.goalId}
                    goalTitle={goal.title}
                    goalAmount={goal.amount}
                    goalDate={goal.date}
                    starred={goal.starred}
                    onStarToggle={handleStarToggle}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </Box>
              </StyledListItem>
            ))}
          </StyledList>
        </>
      )}
    </Box>
  );
};
