import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { StaffSavingFundProvider } from 'src/components/Reports/StaffSavingFund/StaffSavingFundContext';
import { StaffSavingFundLayout } from 'src/components/Reports/StaffSavingFund/StaffSavingFundLayout';

const StaffSavingFundTransfersPage: React.FC = () => {
  const { t } = useTranslation();
  const title = t('Staff Savings Fund Transfers');

  return (
    <StaffSavingFundProvider>
      <StaffSavingFundLayout
        pageTitle={title}
        selectedMenuId="staffSavingFundTransfers"
      >
        <p>TODO</p>
      </StaffSavingFundLayout>
    </StaffSavingFundProvider>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default StaffSavingFundTransfersPage;
