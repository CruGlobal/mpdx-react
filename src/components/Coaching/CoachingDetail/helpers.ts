import theme from 'src/theme';

export const getLastNewsletter = (
  electronicDate: string | null | undefined,
  physicalDate: string | null | undefined,
): string | null => {
  if (electronicDate && physicalDate) {
    return electronicDate > physicalDate ? electronicDate : physicalDate;
  } else if (electronicDate) {
    return electronicDate;
  } else if (physicalDate) {
    return physicalDate;
  } else {
    return null;
  }
};

// Calculate the color of a result based on how close it is to the goal
export const getResultColor = (amount: number, goal: number): string => {
  if (amount >= goal) {
    return theme.palette.statusSuccess.main;
  } else if (amount >= goal * 0.8) {
    return theme.palette.statusWarning.main;
  } else {
    return theme.palette.statusDanger.main;
  }
};
