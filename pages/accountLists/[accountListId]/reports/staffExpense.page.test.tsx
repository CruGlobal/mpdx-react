import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './staffExpense.page';

describe('StaffExpense page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
