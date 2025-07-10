import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import FixMailingAddresses from 'src/components/Tool/FixMailingAddresses/FixMailingAddresses';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixMailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper
      pageTitle={t('Fix Mailing Addresses')}
      selectedMenuId="fixMailingAddresses"
    >
      <FixMailingAddresses accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default FixMailingAddressesPage;
