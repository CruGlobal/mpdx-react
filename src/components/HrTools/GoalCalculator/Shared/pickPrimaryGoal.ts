interface PickableGoal {
  primary: boolean;
  readOnly: boolean;
}

/**
 * Pick the staff member's MPD Goal from goals sorted newest first: the primary goal, else the
 * newest. Read-only goals are converted New Staff goals, not goals calculated here.
 */
export const pickPrimaryGoal = <Goal extends PickableGoal>(
  goals: Goal[] | undefined,
): Goal | undefined => {
  const editableGoals = goals?.filter((goal) => !goal.readOnly);
  return editableGoals?.find((goal) => goal.primary) ?? editableGoals?.[0];
};
