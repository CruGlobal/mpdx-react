import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, CircularProgress, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { MpdGoalCard } from '../GoalCard/MpdGoalCard';
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
  const accountListId = useAccountListId();
  const { data, error, fetchMore } = useGoalCalculationsQuery({
    variables: { accountListId },
  });
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.goalCalculations.pageInfo,
  });
  const [createGoalCalculation, { loading: creating }] =
    useCreateGoalCalculationMutation({
      variables: { accountListId },
    });
  const goals = data?.goalCalculations.nodes
    ?.slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const { data: userData } = useGetUserQuery();
  const defaultName = t('User');
  const firstName = userData?.user.firstName ?? defaultName;

  const handleCreateGoal = async () => {
    const { data } = await createGoalCalculation();
    const goalCalculation = data?.createGoalCalculation?.goalCalculation;
    if (goalCalculation) {
      router.push(
        `/accountLists/${accountListId}/hrTools/goalCalculator/${goalCalculation.id}`,
      );
    }
  };

  return (
    <Container>
      <GoalsListWelcome firstName={firstName} />
      <Stack direction="row" gap={2} pb={3}>
        <Button
          variant="contained"
          onClick={handleCreateGoal}
          disabled={creating}
          startIcon={creating && <CircularProgress size={16} color="inherit" />}
        >
          {t('Create a New Goal')}
        </Button>
        <Button
          variant="outlined"
          href="https://docs.google.com/document/d/1w830y-UUOnhESka9bwA43ozb_2PgFIXp4YZITPbqUx4/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('Learn About Goalsetting (opens in a new tab)')}
        >
          {t('Learn About Goalsetting')}
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : goals?.length === 0 ? (
        <PlaceholderImage src={illustration6graybg} alt="empty" />
      ) : (
        <Stack direction="row" gap={3} flexWrap="wrap">
          {goals?.map((goal) => (
            <MpdGoalCard key={goal.id} goal={goal} />
          ))}
        </Stack>
      )}
    </Container>
  );
};
