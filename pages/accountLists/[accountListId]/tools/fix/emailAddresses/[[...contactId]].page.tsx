import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { FixEmailAddresses } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import { ToolsWrapper } from '../../ToolsWrapper';
import { useToolsHelper } from '../../useToolsHelper';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId } = useToolsHelper();
  const pageUrl = 'tools/fix/emailAddresses';

  return (
    <ToolsWrapper
      pageTitle={t('Fix Email Addresses')}
      pageUrl={pageUrl}
      selectedMenuId="fixEmailAddresses"
    >
      <FixEmailAddresses accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixEmailAddressesPage;
