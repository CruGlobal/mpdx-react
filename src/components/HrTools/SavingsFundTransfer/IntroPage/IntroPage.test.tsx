import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { StaffSavingFundProvider } from '../../StaffSavingFund/StaffSavingFundContext';
import IntroPage from './IntroPage';

const router = { query: { accountListId: 'account-list-1' } };

describe('IntroPage', () => {
  it('sends questions to HR Services with its phone numbers and email, not Staff Services', () => {
    const { getByText, queryByText } = render(
      <TestRouter router={router}>
        <StaffSavingFundProvider>
          <IntroPage title="Savings Fund Transfer" />
        </StaffSavingFundProvider>
      </TestRouter>,
    );

    const contactLine = getByText(/please email HR Services at/);
    expect(contactLine).toHaveTextContent(
      'please email HR Services at HR@cru.org, or call (888) 278-7233 or (407) 826-2287.',
    );
    expect(getByText('HR@cru.org')).toHaveAttribute(
      'href',
      'mailto:HR@cru.org',
    );
    expect(queryByText(/Staff Services/)).not.toBeInTheDocument();
  });
});
