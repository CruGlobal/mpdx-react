export const getRequestUrl = (
  accountListId: string | undefined,
  requestId: string | undefined,
  mode?: 'new' | 'edit' | 'view',
): string => {
  if (!accountListId || !requestId) {
    return '';
  }

  return mode
    ? `/accountLists/${accountListId}/reports/housingAllowance/${requestId}?mode=${mode}`
    : `/accountLists/${accountListId}/reports/housingAllowance/${requestId}`;
};
