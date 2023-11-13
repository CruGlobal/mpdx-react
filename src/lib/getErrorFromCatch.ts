export const getErrorMessage = (err: unknown) => {
  let message;
  if (err instanceof Error) message = err.message;
  else message = String(err);
  return message;
};
