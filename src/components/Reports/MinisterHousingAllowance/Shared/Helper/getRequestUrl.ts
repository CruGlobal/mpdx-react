export const getRequestUrl = (
  accountListId: string | undefined,
  requestId: string | undefined,
  mode?: 'new' | 'edit' | 'view',
): string => {
  if (!accountListId || !requestId) {
    return '';
  }

  const baseUrl = `/accountLists/${accountListId}/reports/housingAllowance/${requestId}`;
  return mode ? `${baseUrl}?mode=${mode}` : baseUrl;
};
