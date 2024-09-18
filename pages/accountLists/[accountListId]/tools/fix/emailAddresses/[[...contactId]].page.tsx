import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { FixEmailAddresses } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import { ToolsWrapper } from '../../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../../useToolsHelper';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/fix/emailAddresses';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Fix Email Addresses')}
      pageUrl={pageUrl}
      selectedMenuId="fixEmailAddresses"
    >
      <FixEmailAddresses
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixEmailAddressesPage;
