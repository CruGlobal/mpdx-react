import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './[goalCalculationId].page';

describe('[goalCalculationId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
