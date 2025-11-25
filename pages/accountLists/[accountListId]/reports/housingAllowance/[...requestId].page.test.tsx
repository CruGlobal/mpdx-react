import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './[...requestId].page';

describe('HousingAllowanceRequest page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
