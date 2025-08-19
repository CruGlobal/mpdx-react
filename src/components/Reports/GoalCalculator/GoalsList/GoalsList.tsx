import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, List, ListItem, styled } from '@mui/material';
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

export const GoalsList: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId() ?? '';
  const { data } = useGoalCalculationsQuery({
    variables: { accountListId },
  });
  const [createGoalCalculation] = useCreateGoalCalculationMutation({
    variables: { accountListId },
  });
  const goals = data?.goalCalculations.nodes ?? [];

  const { data: userData, loading } = useGetUserQuery();
  const firstName = loading ? 'User' : userData?.user?.firstName;

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
    <Box sx={{ p: 3, alignSelf: 'center' }}>
      {goals.length === 0 ? (
        <StyledEmptyStateContainer>
          <Box sx={{ flex: '0 0 auto' }}>
            <img src={illustration6graybg} alt="empty" />
          </Box>
          <StyledEmptyStateContent>
            <GoalsListWelcome firstName={firstName ?? t('User')} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleCreateGoal}>
                {t('Create a New Goal')}
              </Button>

              <Button variant="outlined">{t('Learn About Goalsetting')}</Button>
            </Box>
          </StyledEmptyStateContent>
        </StyledEmptyStateContainer>
      ) : (
        <>
          <GoalsListWelcome firstName={firstName ?? t('User')} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleCreateGoal}>
              {t('Create a New Goal')}
            </Button>
            <Button variant="outlined">{t('Learn About Goalsetting')}</Button>
          </Box>

          <StyledList>
            {goals.map((goal) => (
              <StyledListItem
                key={goal.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  border: 'none',
                }}
                disableGutters
              >
                <Box maxWidth={500} width="100%">
                  <GoalCard goal={goal} />
                </Box>
              </StyledListItem>
            ))}
          </StyledList>
        </>
      )}
    </Box>
  );
};
