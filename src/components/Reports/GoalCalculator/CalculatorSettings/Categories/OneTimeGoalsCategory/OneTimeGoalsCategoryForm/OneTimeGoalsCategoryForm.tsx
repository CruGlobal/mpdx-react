import React, { Fragment } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CurrencyAdornment } from '../../../../Shared/Adornments';

const StyledAddGoalButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderStyle: 'dashed',
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    borderStyle: 'dashed',
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
    opacity: 0.3,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'black',
  padding: theme.spacing(0.5),
}));

interface OneTimeGoalsFormValues {
  // One-time goals fields
  additionalGoals: Array<{
    label: string;
    amount: number;
  }>;
}

export const OneTimeGoalsCategoryForm: React.FC = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<OneTimeGoalsFormValues>();

  const addGoalField = () => {
    const newGoal = { label: '', amount: 0 };
    const updatedGoals = [...values.additionalGoals, newGoal];
    setFieldValue('additionalGoals', updatedGoals);
  };

  const removeGoalField = (index: number) => {
    const updatedGoals = values.additionalGoals.filter((_, i) => i !== index);
    setFieldValue('additionalGoals', updatedGoals);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Dynamic Additional Goals Fields */}
        {values.additionalGoals.map((goal, index) => (
          <Fragment key={index}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Goal Label')}
                value={goal.label}
                onChange={(e) =>
                  setFieldValue(
                    `additionalGoals.${index}.label`,
                    e.target.value,
                  )
                }
                variant="outlined"
                placeholder={t('e.g., Emergency Fund, Equipment')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label={t('Amount')}
                type="number"
                value={goal.amount}
                onChange={(e) =>
                  setFieldValue(
                    `additionalGoals.${index}.amount`,
                    parseFloat(e.target.value) || 0,
                  )
                }
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <StyledIconButton
                      onClick={() => removeGoalField(index)}
                      size="small"
                      aria-label={t('Delete goal')}
                    >
                      <DeleteIcon fontSize="small" />
                    </StyledIconButton>
                  ),
                }}
              />
            </Grid>
          </Fragment>
        ))}

        {/* Add Goal Button */}
        <Grid item xs={12}>
          <StyledAddGoalButton
            variant="outlined"
            onClick={addGoalField}
            size="small"
            fullWidth
          >
            {t('+ Add Goal')}
          </StyledAddGoalButton>
        </Grid>
      </Grid>
    </Box>
  );
};
