import React from 'react';
import { Button, TableCell, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { useSaveField } from '../../Autosave/useSaveField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { useGoalSalary } from '../../Shared/useGoalSalary';

/** The salary from the staff member's MPD Goal, with a button to request it */
export const GoalSalaryRow: React.FC = () => {
  const { t } = useTranslation();
  const { calculation, hcmUser, hcmSpouse, editing } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();
  const saveField = useSaveField();
  const { goal, getGoalSalaries } = useGoalSalary(hcmUser, hcmSpouse);

  const goalSalaries = getGoalSalaries(
    calculation?.calculations,
    calculation?.spouseCalculations,
  );
  if (!goal || !goalSalaries) {
    return null;
  }

  const { salary, spouseSalary } = goalSalaries;
  const goalName = goal.name ?? t('Unnamed Goal');
  const handleUseGoalSalary = () =>
    saveField({
      ...(salary !== null && { salary }),
      ...(spouseSalary !== null && { spouseSalary }),
    });

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {t('MPD Goal Salary')}
        <Typography variant="caption" color="textSecondary" display="block">
          {t('From your goal: {{goalName}}', { goalName })}
        </Typography>
        <Button
          size="small"
          onClick={handleUseGoalSalary}
          disabled={!editing}
          sx={{ px: 0 }}
        >
          {t('Use Goal Salary')}
        </Button>
      </TableCell>
      <TableCell>{formatCurrency(salary)}</TableCell>
      {hcmSpouse && <TableCell>{formatCurrency(spouseSalary)}</TableCell>}
    </TableRow>
  );
};
