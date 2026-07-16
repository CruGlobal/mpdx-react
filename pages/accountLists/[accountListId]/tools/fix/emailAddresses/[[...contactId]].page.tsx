import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockRestrictedImpersonation } from 'pages/api/utils/pagePropsHelpers';
import { FixEmailAddresses } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper
      pageTitle={t('Fix Email Addresses')}
      selectedMenuId="fixEmailAddresses"
    >
      <FixEmailAddresses accountListId={accountListId} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = blockRestrictedImpersonation;

export default FixEmailAddressesPage;
