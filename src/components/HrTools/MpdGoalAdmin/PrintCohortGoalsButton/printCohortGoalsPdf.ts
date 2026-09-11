// Two minutes, not seconds: the endpoint renders the whole cohort's multi-page Prawn PDF inside the request.
const PDF_REQUEST_TIMEOUT_MS = 120_000;

/**
 * Redeems the print mutation's single-use `downloadUrl` for a blob URL.
 *
 * The token goes in the Authorization header, never the access_token query param the endpoint also
 * accepts: that would leak a full-account JWT into browser history, bookmarks and proxy logs.
 */
export const fetchCohortGoalsPdf = async (
  downloadUrl: string,
  apiToken: string,
): Promise<string> => {
  try {
    const response = await fetch(downloadUrl, {
      headers: { authorization: `Bearer ${apiToken}` },
      signal: AbortSignal.timeout(PDF_REQUEST_TIMEOUT_MS),
    });

    // The token burns on the first redemption, so a failure here cannot be retried with the same URL.
    if (!response.ok) {
      throw new Error(`MPD Goals PDF request failed: ${response.status}`);
    }

    return URL.createObjectURL(await response.blob());
  } catch (error) {
    // Retimed as a plain error because the native TimeoutError reads as if the user cancelled.
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error(
        `MPD Goals PDF request timed out after ${PDF_REQUEST_TIMEOUT_MS}ms`,
      );
    }
    throw error;
  }
};

/** Downloads `url` via a temporary anchor, as the contacts CSV export does. */
export const downloadPdf = (url: string, filename: string): void => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
};
