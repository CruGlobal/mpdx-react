import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { FixEmailAddresses } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
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

export const getServerSideProps = ensureSessionAndAccountList;

export default FixEmailAddressesPage;
