import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, Button, List, ListItem, styled } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { GoalCard } from '../GoalCard/GoalCard';
import { useCreateGoalCalculationMutation } from './CreateGoalCalculation.generated';
import { GoalsListWelcome } from './GoalsListWelcome';

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
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [goals, setGoals] = useState<GoalCardData[]>(mockGoalCards);
  const [deleteGoalDialog, setDeleteGoalDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<GoalCardData | null>(null);

  const { data, loading } = useGetUserQuery();
  const firstName = loading ? 'User' : data?.user?.firstName;

  const [createGoalCalculation, { loading: isCreatingGoal }] =
    useCreateGoalCalculationMutation({
      onCompleted: (data) => {
        const goalCalculationId =
          data.createGoalCalculation?.goalCalculation?.id;
        if (goalCalculationId) {
          router.push(
            `/accountLists/${router.query.accountListId}/reports/goalCalculator/${goalCalculationId}`,
          );
        }
      },
      onError: (error) => {
        const errorMessage =
          error?.message ||
          error?.graphQLErrors?.[0]?.message ||
          'Unknown error occurred';
        enqueueSnackbar(
          t('Failed to create goal calculation: {{error}}', {
            error: errorMessage,
          }),
          {
            variant: 'error',
          },
        );
      },
    });

  const handleCreateGoal = () => {
    createGoalCalculation({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            primary: true,
            isCurrent: true,
          },
        },
      },
    });
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
            <img src={illustration6graybg} alt="empty" />
          </Box>
          <StyledEmptyStateContent>
            <GoalsListWelcome firstName={firstName ?? t('User')} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleCreateGoal}
                disabled={isCreatingGoal}
              >
                {isCreatingGoal && !data
                  ? t('Creating...')
                  : t('Create a New Goal')}
              </Button>

              <Button variant="outlined">{t('Learn About Goalsetting')}</Button>
            </Box>
          </StyledEmptyStateContent>
        </StyledEmptyStateContainer>
      ) : (
        <>
          <GoalsListWelcome firstName={firstName ?? t('User')} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleCreateGoal}
              disabled={isCreatingGoal}
            >
              {isCreatingGoal && !data
                ? t('Creating...')
                : t('Create a New Goal')}
            </Button>
            <Button variant="outlined">{t('Learn About Goalsetting')}</Button>
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
