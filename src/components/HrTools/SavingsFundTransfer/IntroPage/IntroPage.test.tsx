import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { StaffSavingFundProvider } from '../../StaffSavingFund/StaffSavingFundContext';
import IntroPage from './IntroPage';

const router = { query: { accountListId: 'account-list-1' } };

describe('IntroPage', () => {
  it('sends questions to HR Services, not Staff Services', () => {
    const { getByText, queryByText } = render(
      <TestRouter router={router}>
        <StaffSavingFundProvider>
          <IntroPage title="Savings Fund Transfer" />
        </StaffSavingFundProvider>
      </TestRouter>,
    );

    expect(
      getByText(/please contact HR Services at/, { exact: false }),
    ).toBeInTheDocument();
    expect(getByText('HR@cru.org')).toHaveAttribute(
      'href',
      'mailto:HR@cru.org',
    );
    expect(queryByText(/Staff Services/)).not.toBeInTheDocument();
  });
});
