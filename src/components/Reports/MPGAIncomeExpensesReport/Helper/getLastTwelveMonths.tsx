export const getLast12Months = (): string[] => {
  const result: string[] = [];
  const date = new Date();

  for (let i = 0; i < 12; i++) {
    const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const formatted = month.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });
    result.push(formatted);
  }

  return result.reverse();
};
