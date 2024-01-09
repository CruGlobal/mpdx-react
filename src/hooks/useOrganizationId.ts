import { useGetTopBarQuery } from 'src/components/Layouts/Primary/TopBar/GetTopBar.generated';
import { useAccountListId } from './useAccountListId';

export const useOrganizationId = (): string | undefined => {
  const { data } = useGetTopBarQuery();
  const accountListId = useAccountListId();
  return (
    (accountListId &&
      data?.accountLists.nodes.find(
        (accountList) => accountList.id === accountListId,
      )?.salaryOrganizationId) ??
    undefined
  );
};
