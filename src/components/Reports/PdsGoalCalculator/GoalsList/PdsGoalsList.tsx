import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, CircularProgress, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { PdsGoalCard } from '../GoalCard/PdsGoalCard';
import {
  useCreatePdsGoalCalculationMutation,
  useDeletePdsGoalCalculationMutation,
  usePdsGoalCalculationsQuery,
} from './PdsGoalCalculations.generated';
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
  const router = useRouter();
  const accountListId = useAccountListId() ?? '';

  const { data: userData } = useGetUserQuery();
  const defaultName = t('User');
  const firstName = userData?.user.firstName ?? defaultName;

  const { data, loading } = usePdsGoalCalculationsQuery();
  const [createPdsGoalCalculation] = useCreatePdsGoalCalculationMutation();
  const [deletePdsGoalCalculation] = useDeletePdsGoalCalculationMutation();
  const { goalMiscConstants, loading: constantsLoading } =
    useGoalCalculatorConstants();

  const goals = data?.designationSupportCalculations.nodes;

  const handleDeleteGoal = async (id: string) => {
    await deletePdsGoalCalculation({
      variables: { id },
      update: (cache) => {
        cache.evict({ id: `DesignationSupportCalculation:${id}` });
        cache.gc();
      },
    });
  };

  const handleCreateGoal = async () => {
    const { data } = await createPdsGoalCalculation({
      variables: {
        attributes: {
          ministryCellPhone:
            goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.PHONE?.fee,
          ministryInternet:
            goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.INTERNET?.fee,
        },
      },
    });
    const calculation =
      data?.createDesignationSupportCalculation?.designationSupportCalculation;

    if (calculation) {
      router.push(
        `/accountLists/${accountListId}/reports/pdsGoalCalculator/${calculation.id}`,
      );
    }
  };

  return (
    <Container>
      <PdsGoalsListWelcome firstName={firstName} />
      <Stack direction="row" gap={2} pb={3}>
        <Button
          variant="contained"
          onClick={handleCreateGoal}
          disabled={constantsLoading}
        >
          {t('Create a New Goal')}
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : goals?.length === 0 ? (
        <PlaceholderImage
          src={illustration6graybg}
          alt=""
          role="presentation"
        />
      ) : (
        <Stack direction="row" gap={3} flexWrap="wrap">
          {goals?.map((goal) => (
            <PdsGoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </Stack>
      )}
    </Container>
  );
};
