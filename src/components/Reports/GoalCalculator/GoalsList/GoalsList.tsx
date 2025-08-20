import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, CircularProgress, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { GoalCard } from '../GoalCard/GoalCard';
import {
  useCreateGoalCalculationMutation,
  useGoalCalculationsQuery,
} from './GoalCalculations.generated';
import { GoalsListWelcome } from './GoalsListWelcome';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  // Pad the sides to ensure that the container is never wider than 1200px
  marginInline: `max(0px, (100% - 1200px) / 2)`,
}));

const PlaceholderImage = styled('img')(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export const GoalsList: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId() ?? '';
  const { data, loading } = useGoalCalculationsQuery({
    variables: { accountListId },
  });
  const [createGoalCalculation] = useCreateGoalCalculationMutation({
    variables: { accountListId },
  });
  const goals = data?.goalCalculations.nodes;

  const { data: userData } = useGetUserQuery();
  const defaultName = t('User');
  const firstName = userData?.user.firstName ?? defaultName;

  const handleCreateGoal = async () => {
    const { data } = await createGoalCalculation();
    const goalCalculation = data?.createGoalCalculation?.goalCalculation;
    if (goalCalculation) {
      router.push(
        `/accountLists/${accountListId}/reports/goalCalculator/${goalCalculation.id}`,
      );
    }
  };

  return (
    <Container>
      <GoalsListWelcome firstName={firstName} />
      <Stack direction="row" gap={2} pb={3}>
        <Button variant="contained" onClick={handleCreateGoal}>
          {t('Create a New Goal')}
        </Button>
        <Button variant="outlined">{t('Learn About Goalsetting')}</Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : goals?.length === 0 ? (
        <PlaceholderImage src={illustration6graybg} alt="empty" />
      ) : (
        <Stack direction="row" gap={3} flexWrap="wrap">
          {goals?.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </Stack>
      )}
    </Container>
  );
};
