export const snakeToCamel = (inputKey: string): string => {
  const stringParts = inputKey.split('_');

  return stringParts.reduce((outputKey, part, index) => {
    if (index === 0) {
      return part;
    }

    return `${outputKey}${part.charAt(0).toUpperCase()}${part.slice(1)}`;
  }, '');
};

export const camelToSnake = (inputKey: string): string => {
  return inputKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
