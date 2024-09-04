import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import Loading from 'src/components/Loading';
import GoogleImport from 'src/components/Tool/GoogleImport/GoogleImport';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../ToolsWrapper';

const GoogleImportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const pageUrl = 'tools/import/google';

  return (
    <ToolsWrapper
      pageTitle={t('Import from Google')}
      pageUrl={pageUrl}
      selectedMenuId="import/google"
    >
      {accountListId ? (
        <GoogleImport accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default GoogleImportPage;
