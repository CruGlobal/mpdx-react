import React from 'react';
import { Box, Button, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { PdsGoalsListWelcome } from './PdsGoalsListWelcome';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginInline: `max(0px, (100% - 1200px) / 2)`,
}));

const PlaceholderImage = styled('img')(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export const PdsGoalsList: React.FC = () => {
  const { t } = useTranslation();
  const _accountListId = useAccountListId() ?? '';

  const { data: userData } = useGetUserQuery();
  const defaultName = t('User');
  const firstName = userData?.user.firstName ?? defaultName;

  // TODO: Replace with real GraphQL query and mutation when backend is ready
  const goals: never[] = [];

  const handleCreateGoal = async () => {
    // TODO: Call createPdsGoal mutation, then navigate:
    // router.push(`/accountLists/${_accountListId}/reports/pds-goal-calculator/${newGoalId}`);
  };

  return (
    <Container>
      <PdsGoalsListWelcome firstName={firstName} />
      <Stack direction="row" gap={2} pb={3}>
        <Button variant="contained" onClick={handleCreateGoal}>
          {t('Create a New Goal')}
        </Button>
      </Stack>

      {goals.length === 0 ? (
        <PlaceholderImage src={illustration6graybg} alt="empty" />
      ) : (
        <Stack direction="row" gap={3} flexWrap="wrap">
          {/* TODO: Map over goals and render PdsGoalCard */}
        </Stack>
      )}
    </Container>
  );
};
