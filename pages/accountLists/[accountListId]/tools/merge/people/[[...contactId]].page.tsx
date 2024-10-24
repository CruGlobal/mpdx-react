import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import MergePeople from 'src/components/Tool/MergePeople/MergePeople';
import { ToolsWrapper } from '../../ToolsWrapper';
import { useToolsHelper } from '../../useToolsHelper';

const MergePeoplePage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId } = useToolsHelper();
  const pageUrl = 'tools/merge/people';

  return (
    <ToolsWrapper
      pageTitle={t('Merge People')}
      pageUrl={pageUrl}
      selectedMenuId="mergePeople"
    >
      <MergePeople accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default MergePeoplePage;
