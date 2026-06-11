/**
 * Decodes a base64 string into a `File`. Pure (no fetch, no DOM beyond `atob`)
 * so it is trivially unit-testable. Used to convert `@capacitor/camera`
 * Base64 results into the `File` the existing avatar pipeline expects.
 */
export const base64ToFile = (
  base64: string,
  mimeType: string,
  fileName: string,
): File => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([bytes], fileName, { type: mimeType });
};
