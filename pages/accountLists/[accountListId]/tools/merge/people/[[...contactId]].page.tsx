import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import MergePeople from 'src/components/Tool/MergePeople/MergePeople';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const MergePeoplePage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper pageTitle={t('Merge People')} selectedMenuId="mergePeople">
      <MergePeople accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default MergePeoplePage;
