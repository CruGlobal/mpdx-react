import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import { FormikProps } from 'formik';

interface OneTimeGoalsFormValues {
  // One-time goals fields
  additionalGoals: Array<{
    label: string;
    amount: number;
  }>;
}

interface OneTimeGoalsStepFormProps {
  formikProps: FormikProps<OneTimeGoalsFormValues>;
}

export const OneTimeGoalsStepForm: React.FC<OneTimeGoalsStepFormProps> = ({
  formikProps,
}) => {
  const { values, setFieldValue } = formikProps;

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
          <React.Fragment key={index}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Goal Label"
                value={goal.label}
                onChange={(e) =>
                  setFieldValue(
                    `additionalGoals.${index}.label`,
                    e.target.value,
                  )
                }
                variant="outlined"
                placeholder="e.g., Emergency Fund, Equipment"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Amount"
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
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                  endAdornment: (
                    <IconButton
                      onClick={() => removeGoalField(index)}
                      size="small"
                      aria-label="Delete goal"
                      sx={{ color: 'black', p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </React.Fragment>
        ))}

        {/* Add Goal Button */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={addGoalField}
            size="small"
            fullWidth
            sx={{
              mt: 1,
              borderStyle: 'dashed',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderStyle: 'dashed',
                borderColor: 'primary.dark',
                backgroundColor: 'primary.light',
                opacity: 0.1,
              },
            }}
          >
            + Add Goal
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
