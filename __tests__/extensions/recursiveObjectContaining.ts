// Return an object like expect.objectContaining does, except that it handles recursive fields
export const recursiveObjectContaining = (field: unknown) => {
  if (Array.isArray(field)) {
    return field.map((item) => recursiveObjectContaining(item));
  } else if (field && typeof field === 'object') {
    return expect.objectContaining(
      Object.fromEntries(
        Object.entries(field).map(([key, value]) => [
          key,
          recursiveObjectContaining(value),
        ]),
      ),
    );
  } else {
    return field;
  }
};
