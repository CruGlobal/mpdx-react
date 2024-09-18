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

export const camelToSnakeObject = (object: object): object => {
  const conversionMap = Object.entries(object).reduce((acc, current) => {
    acc[current[0] as string] = current[0].replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    return acc;
  }, {});

  const convertedObject = {};
  for (const [key, value] of Object.entries(conversionMap)) {
    convertedObject[value as string] = object[key];
  }
  return convertedObject;
};
