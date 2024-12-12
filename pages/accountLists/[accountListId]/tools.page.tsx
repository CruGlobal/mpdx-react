import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SetupBanner } from 'src/components/Settings/preferences/SetupBanner';
import { StickyBox } from 'src/components/Shared/Header/styledComponents';
import ToolsHome from 'src/components/Tool/Home/ToolsHome';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from './tools/ToolsWrapper';

const ToolsPage = (): ReactElement => {
  const { t } = useTranslation();
  const { push, query } = useRouter();
  const accountListId = useAccountListId();

  const { setup } = query;
  const onSetupTour = setup === '1';

  const handleSetupChange = async () => {
    push(`/accountLists/${accountListId}`);
  };
  return (
    <ToolsWrapper pageUrl={'tools'} pageTitle={t('Tools')}>
      <>
        {onSetupTour && (
          <StickyBox>
            <SetupBanner
              button={
                <Button variant="contained" onClick={handleSetupChange}>
                  {t('Skip Step')}
                </Button>
              }
              title={t(
                'Select one of the highlighted tools below to begin importing your data.',
              )}
            />
          </StickyBox>
        )}
        <ToolsHome onSetupTour={onSetupTour} />
      </>
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ToolsPage;
