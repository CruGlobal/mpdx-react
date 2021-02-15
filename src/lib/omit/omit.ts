// eslint-disable-next-line @typescript-eslint/no-explicit-any
const omit = (keysToOmit: string[], originalObj = {}): any =>
    Object.fromEntries(Object.entries(originalObj).filter(([key]) => !keysToOmit.includes(key)));

export default omit;
