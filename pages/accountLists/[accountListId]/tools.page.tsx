import React, { ReactElement } from 'react';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import ToolHome from 'src/components/Tool/Home/Home';
import { ToolsWrapper } from './tools/ToolsWrapper';

const ToolsPage = (): ReactElement => {
  const pageUrl = 'tools';

  return (
    <ToolsWrapper pageUrl={pageUrl}>
      <ToolHome />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default ToolsPage;
