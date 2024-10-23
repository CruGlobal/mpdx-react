import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import FixMailingAddresses from 'src/components/Tool/FixMailingAddresses/FixMailingAddresses';
import { ToolsWrapper } from '../../ToolsWrapper';
import { useToolsHelper } from '../../useToolsHelper';

const FixMailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId } = useToolsHelper();
  const pageUrl = 'tools/fix/mailingAddresses';

  return (
    <ToolsWrapper
      pageTitle={t('Fix Mailing Addresses')}
      pageUrl={pageUrl}
      selectedMenuId="fixMailingAddresses"
    >
      <FixMailingAddresses accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixMailingAddressesPage;
