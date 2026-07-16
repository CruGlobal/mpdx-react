import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  styled,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useRestrictedImpersonation } from 'src/hooks/useRestrictedImpersonation';
import illustration6graybg from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-6-gray-bg.svg';
import { PdsGoalCard } from '../GoalCard/PdsGoalCard';
import { CreateGoalDialog } from './CreateGoalDialog';
import {
  useCreatePdsGoalCalculationMutation,
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
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();
  const restrictedImpersonation = useRestrictedImpersonation();

  const { data: userData } = useGetUserQuery();
  const defaultName = t('User');
  const firstName = userData?.user.firstName ?? defaultName;

  const { data, error, fetchMore } = usePdsGoalCalculationsQuery();
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.designationSupportCalculations.pageInfo,
  });
  const [createPdsGoalCalculation] = useCreatePdsGoalCalculationMutation();
  const { goalMiscConstants, loading: constantsLoading } =
    useGoalCalculatorConstants();

  const [dialogOpen, setDialogOpen] = useState(false);

  const goals = data?.designationSupportCalculations.nodes;

  const handleCreateGoal = async (formType: DesignationSupportFormType) => {
    const isDetailed = formType === DesignationSupportFormType.Detailed;
    let detailedDefaults: {
      ministryCellPhone: number;
      ministryInternet: number;
    } | null = null;
    if (isDetailed) {
      const reimbursements = goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM;
      const phoneFee = reimbursements?.PHONE?.fee;
      const internetFee = reimbursements?.INTERNET?.fee;
      if (phoneFee === undefined || internetFee === undefined) {
        enqueueSnackbar(
          t(
            'Could not load required defaults. Please try again or pick Simple.',
          ),
          { variant: 'error' },
        );
        return;
      }
      detailedDefaults = {
        ministryCellPhone: phoneFee,
        ministryInternet: internetFee,
      };
    }
    const { data } = await createPdsGoalCalculation({
      variables: {
        attributes: {
          formType,
          ...(detailedDefaults ?? {}),
        },
      },
      refetchQueries: ['PdsGoalCalculations'],
    });
    const calculation =
      data?.createDesignationSupportCalculation?.designationSupportCalculation;

    if (calculation) {
      setDialogOpen(false);
      router.push(
        `/accountLists/${accountListId}/hrTools/pdsGoalCalculator/${calculation.id}`,
      );
    }
  };

  return (
    <Container>
      <PdsGoalsListWelcome firstName={firstName} />
      <Stack direction="row" gap={2} pb={3}>
        <Tooltip
          title={
            restrictedImpersonation ? t('Read-only while impersonating') : ''
          }
        >
          <span>
            <Button
              variant="contained"
              onClick={() => setDialogOpen(true)}
              disabled={constantsLoading || restrictedImpersonation}
            >
              {t('Create a New Goal')}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <CreateGoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreateGoal}
      />

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
            <PdsGoalCard key={goal.id} goal={goal} />
          ))}
        </Stack>
      )}
    </Container>
  );
};
