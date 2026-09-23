// Links come from the server and the model, so only http and https may reach an href
export const toSafeHttpUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
