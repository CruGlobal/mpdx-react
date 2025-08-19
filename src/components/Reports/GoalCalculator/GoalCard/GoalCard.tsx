import NextLink from 'next/link';
import React from 'react';
import { Star, StarBorderOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';

const StyledCard = styled(Card)({
  minWidth: 350,
  borderRadius: theme.shape.borderRadius,
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
});

const StyledTitleBox = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
});

const StyledStarButton = styled(IconButton)({
  position: 'absolute',
  right: 0,
  padding: theme.spacing(2),
});

const StyledContentBox = styled(Box)({
  marginTop: theme.spacing(2),
});

const StyledContentInnerBox = styled(Box)({
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
});

const StyledInfoRow = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: 72,
});

const StyledActionBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
});

export interface GoalCardProps {
  goal: ListGoalCalculationFragment;
  onStarToggle: (goal: ListGoalCalculationFragment) => void;
  onDelete: (goal: ListGoalCalculationFragment) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onStarToggle,
  onDelete,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();

  const handleStarClick = () => {
    onStarToggle(goal);
  };

  const handleDelete = () => {
    onDelete(goal);
  };

  return (
    <StyledCard>
      <StyledHeaderBox>
        <StyledTitleBox>
          <Typography data-testid="goal-title" variant="h6">
            {goal.createdAt}
          </Typography>
        </StyledTitleBox>
        <StyledStarButton aria-label="star-button" onClick={handleStarClick}>
          {goal.isCurrent ? (
            <Star color="primary" sx={{ verticalAlign: 'middle' }} />
          ) : (
            <StarBorderOutlined
              color="primary"
              sx={{ verticalAlign: 'middle' }}
            />
          )}
        </StyledStarButton>
      </StyledHeaderBox>

      <Divider />

      <StyledContentBox>
        <StyledContentInnerBox>
          <StyledInfoRow pb={theme.spacing(1)}>
            <Typography variant="body1" fontWeight="bold" pl={2}>
              {t('Goal Amount')}
            </Typography>
            <Typography data-testid="goal-amount-value" variant="body1">
              {currencyFormat(0, 'USD', locale)}
            </Typography>
          </StyledInfoRow>

          <Divider />

          <StyledInfoRow pt={theme.spacing(1)}>
            <Typography variant="body1" fontWeight="bold" pl={2}>
              {t('Last Updated')}
            </Typography>
            <Typography data-testid="date-value" variant="body1">
              {new Date(goal.createdAt).toLocaleString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
          </StyledInfoRow>
        </StyledContentInnerBox>
      </StyledContentBox>

      <Divider sx={{ mt: 2, mb: 1 }} />

      <StyledActionBox>
        <Button onClick={handleDelete}>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={theme.palette.error.main}
          >
            {t('Delete')}
          </Typography>
        </Button>
        <Button
          LinkComponent={NextLink}
          href={`/accountLists/${accountListId}/reports/goalCalculator/${goal.id}`}
          variant="contained"
          color="primary"
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color={theme.palette.primary.contrastText}
          >
            {t('View')}
          </Typography>
        </Button>
      </StyledActionBox>
    </StyledCard>
  );
};
