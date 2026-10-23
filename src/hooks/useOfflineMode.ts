import { useRouter } from 'next/router';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';

// Flows and Map need live data, so they ignore the offline parameter
export const useOfflineMode = (): boolean => {
  const { query } = useRouter();
  const viewMode = Array.isArray(query.contactId)
    ? query.contactId[0]
    : undefined;

  return (
    query.offline === 'true' &&
    viewMode !== TableViewModeEnum.Flows &&
    viewMode !== TableViewModeEnum.Map
  );
};
