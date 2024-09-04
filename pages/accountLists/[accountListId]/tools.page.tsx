import React, { ReactElement } from 'react';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import ToolHome from 'src/components/Tool/Home/Home';
import { ToolsWrapper } from './tools/ToolsWrapper';

const ToolsPage = (): ReactElement => {
  return (
    <ToolsWrapper pageUrl={'tools'}>
      <ToolHome />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default ToolsPage;
