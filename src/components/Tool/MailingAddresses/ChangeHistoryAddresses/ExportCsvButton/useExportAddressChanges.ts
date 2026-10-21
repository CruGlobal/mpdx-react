import { useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import {
  AddressChangeHistoryQuery,
  useAddressChangeHistoryQuery,
} from '../AddressChangeHistory.generated';
import { downloadAddressChanges } from './downloadAddressChanges';

interface UseExportAddressChangesProps {
  history: AddressChangeHistoryQuery['addressChangeHistory'] | undefined;
  fetchMore: ReturnType<typeof useAddressChangeHistoryQuery>['fetchMore'];
  error: ApolloError | undefined;
}

export const useExportAddressChanges = ({
  history,
  fetchMore,
  error,
}: UseExportAddressChangesProps) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { data: userData } = useGetUserQuery();
  const [exporting, setExporting] = useState(false);

  useFetchAllPages({
    // A rejected page never sets the query's error, so stop here or the export never ends.
    // The global error link already shows and reports the failure. The cast is safe because
    // useFetchAllPages ignores fetchMore's result, which is undefined after a failure here.
    fetchMore: ((options) =>
      fetchMore(options).catch(() => {
        setExporting(false);
      })) as typeof fetchMore,
    error,
    pageInfo: exporting ? history?.pageInfo : undefined,
  });

  useEffect(() => {
    if (exporting && error) {
      setExporting(false);
    } else if (exporting && history && !history.pageInfo.hasNextPage) {
      downloadAddressChanges(
        history.nodes,
        userData?.user.id,
        getLocalizedContactStatus,
        t,
        locale,
      );
      setExporting(false);
    }
  }, [exporting, history, error]);

  return { exporting, startExport: () => setExporting(true) };
};
