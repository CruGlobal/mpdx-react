import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './transfers.page';

describe('StaffSavingFundTransfers page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
