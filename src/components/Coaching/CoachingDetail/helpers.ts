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
