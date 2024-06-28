import React, { ReactElement, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import {
  AppealsContext,
  AppealsType,
} from 'src/components/Tool/Appeal/ContactsContext/AppealsContext';
import { DynamicAppealsDetailsPage } from 'src/components/Tool/Appeal/DynamicAppealsDetailsPage';
import { DynamicAppealsInitialPage } from 'src/components/Tool/Appeal/DynamicAppealsInitialPage';
import { ToolsWrapper } from '../ToolsWrapper';
import { AppealsWrapper, PageEnum } from './AppealsWrapper';

const Appeals = (): ReactElement => {
  const { t } = useTranslation();
  const { page } = useContext(AppealsContext) as AppealsType;
  const pageUrl = 'appeals';

  return (
    <ToolsWrapper
      pageTitle={t('Appeals')}
      pageUrl={pageUrl}
      selectedMenuId="appeals"
    >
      <>
        {page === PageEnum.InitialPage && <DynamicAppealsInitialPage />}

        {(page === PageEnum.DetailsPage || page === PageEnum.ContactsPage) && (
          <DynamicAppealsDetailsPage />
        )}
      </>
    </ToolsWrapper>
  );
};

const AppealsPage: React.FC = () => (
  <AppealsWrapper>
    <Appeals />
  </AppealsWrapper>
);

export default AppealsPage;

export const getServerSideProps = loadSession;
