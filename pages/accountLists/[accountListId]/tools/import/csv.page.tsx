import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import {
  CsvImportProvider,
  CsvImportViewStepEnum,
} from 'src/components/Tool/Import/Csv/CsvImportContext';
import { CsvImportWrapper } from 'src/components/Tool/Import/Csv/CsvImportWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../ToolsWrapper';

const CsvHome: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const pageUrl = 'tools/import/csv';

  const { query, replace, pathname, isReady } = useRouter();
  const urlTab = query?.tab as CsvImportViewStepEnum.Upload;
  const urlCsvFileId = query?.id as string;
  const [currentTab, setCurrentTab] = useState<CsvImportViewStepEnum>(
    urlTab || CsvImportViewStepEnum.Upload,
  );
  const defaultPageHeader = t('Tools - Import - CSV');
  const [pageTitle, setPageTitle] = useState(defaultPageHeader);
  const [csvFileId, setCsvFileId] = useState(urlCsvFileId ?? '');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    replace({
      pathname,
      query: {
        accountListId,
        tab: currentTab,
        ...(csvFileId ? { id: csvFileId } : undefined),
      },
    });
  }, [currentTab, csvFileId, isReady]);

  useEffect(() => {
    setPageTitle(getPageTitle());
  }, [currentTab, pageTitle]);

  const getPageTitle = (): string => {
    switch (currentTab) {
      case CsvImportViewStepEnum.Upload:
        return 'Tools - Import - CSV - Upload';
      case CsvImportViewStepEnum.Headers:
        return 'Tools - Import - CSV - Headers';
      case CsvImportViewStepEnum.Values:
        return 'Tools - Import - CSV - Values';
      case CsvImportViewStepEnum.Preview:
        return 'Tools - Import - CSV - Preview';
      default:
        return 'Tools - Import - CSV';
    }
  };

  return (
    <ToolsWrapper
      pageTitle={t('Import from CSV')}
      pageUrl={pageUrl}
      selectedMenuId="import/csv"
    >
      <CsvImportProvider csvFileId={csvFileId}>
        <CsvImportWrapper
          accountListId={accountListId}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setCsvFileId={setCsvFileId}
          t={t}
        />
      </CsvImportProvider>
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default CsvHome;
