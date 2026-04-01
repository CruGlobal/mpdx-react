import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './[pdsGoalId].page';

describe('[pdsGoalId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
