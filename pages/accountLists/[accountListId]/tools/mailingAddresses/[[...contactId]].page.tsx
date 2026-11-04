import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { MailingAddresses } from 'src/components/Tool/MailingAddresses/MailingAddresses';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../ToolsWrapper';

const MailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper
      pageTitle={t('Mailing Addresses')}
      selectedMenuId="mailingAddresses"
    >
      <MailingAddresses accountListId={accountListId} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default MailingAddressesPage;
