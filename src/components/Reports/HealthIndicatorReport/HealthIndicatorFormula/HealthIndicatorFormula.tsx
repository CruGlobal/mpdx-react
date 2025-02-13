import React, { Dispatch, SetStateAction, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  AccordionDetails,
  AccordionSummary,
  Card,
  Skeleton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { GroupedAccordion } from 'src/components/Shared/Forms/Accordions/GroupedAccordion';
import { ConsistencyExplanation } from './ConsistencyExplanation';
import { DepthExplanation } from './DepthExplanation';
import { useHealthIndicatorFormulaQuery } from './HealthIndicatorFormula.generated';
import { OwnershipExplanation } from './OwnershipExplanation';
import { SuccessExplanation } from './SuccessExplanation';

const StyledSummary = styled(AccordionSummary)({
  '.MuiAccordionSummary-content': {
    display: 'flex',
    gap: '0.5ch',
    alignItems: 'center',
  },
});

const StyledDetails = styled(AccordionDetails)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),

  ul: {
    marginLeft: theme.spacing(2),
  },
}));

interface HealthIndicatorFormulaProps {
  accountListId: string;
  noHealthIndicatorData: boolean;
  setNoHealthIndicatorData: Dispatch<SetStateAction<boolean>>;
}

export const HealthIndicatorFormula: React.FC<HealthIndicatorFormulaProps> = ({
  accountListId,
  noHealthIndicatorData,
  setNoHealthIndicatorData,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useHealthIndicatorFormulaQuery({
    variables: {
      accountListId,
    },
  });

  useEffect(() => {
    if (!data?.healthIndicatorData?.length && !loading) {
      setNoHealthIndicatorData(true);
    }
  }, [data, loading]);

  const latestMpdHealthData = data?.healthIndicatorData.at(-1);

  if (noHealthIndicatorData) {
    return null;
  }

  return (
    <Card sx={{ padding: 3, mb: 5 }}>
      <Typography variant="h6" mb={2}>
        {t('MPD Health')} = [({t('Ownership')} x 3) + ({t('Success')} x 2) + (
        {t('Consistency')} x 1) + ({t('Depth')} x 1)] / 7
      </Typography>
      <FormulaItem
        name={t('Ownership')}
        description={t('% of self-raised funds over total funds')}
        explanation={<OwnershipExplanation />}
        value={latestMpdHealthData?.ownershipHi ?? 0}
        isLoading={loading && !data}
      />
      <FormulaItem
        name={t('Success')}
        description={t('% of self-raised funds over support goal')}
        explanation={<SuccessExplanation />}
        value={latestMpdHealthData?.successHi ?? 0}
        isLoading={loading && !data}
      />
      <FormulaItem
        name={t('Consistency')}
        description={t('% of months with positive account balance')}
        value={latestMpdHealthData?.consistencyHi ?? 0}
        explanation={<ConsistencyExplanation />}
        isLoading={loading && !data}
      />
      <FormulaItem
        name={t('Depth')}
        description={t('Trend of local partners')}
        explanation={<DepthExplanation />}
        value={latestMpdHealthData?.depthHi ?? 0}
        isLoading={loading && !data}
      />
    </Card>
  );
};

interface FormulaItemProps {
  name: string;
  description: string;
  explanation?: React.ReactNode;
  value: number;
  isLoading: boolean;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  name,
  description,
  explanation,
  value,
  isLoading,
}) => (
  <GroupedAccordion disableGutters>
    <StyledSummary expandIcon={<ExpandMoreIcon />}>
      {isLoading ? (
        <Skeleton width={60} height={42} />
      ) : (
        <Typography variant="h4" color="primary" fontWeight="bold" width={60}>
          {value}
        </Typography>
      )}
      <Typography fontWeight="bold">{name} =</Typography>
      <Typography>{description}</Typography>
    </StyledSummary>
    <StyledDetails>{explanation}</StyledDetails>
  </GroupedAccordion>
);
